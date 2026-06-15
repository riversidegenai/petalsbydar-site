import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";

// Square sends a HMAC-SHA256 signature in the `x-square-hmacsha256-signature`
// header so we can verify the request actually came from Square and not a
// random actor who discovered the endpoint.
function verifySquareSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string,
  notificationUrl: string,
): boolean {
  const payload = notificationUrl + body;
  const expected = createHmac("sha256", webhookSignatureKey)
    .update(payload)
    .digest("base64");
  return expected === signature;
}

// Square delivers webhooks as JSON. We need the raw body bytes to verify the
// signature before parsing, so we cannot use req.json() directly.
export async function POST(req: Request) {
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;

  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";

  // If the webhook keys are configured, verify the signature. If they are not
  // configured yet (e.g. during initial setup), let the event through so the
  // route can be wired up and tested without breaking anything.
  if (webhookSignatureKey && notificationUrl) {
    const valid = verifySquareSignature(
      rawBody,
      signature,
      webhookSignatureKey,
      notificationUrl,
    );
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.type as string | undefined;

  // We only care about completed payments. Ignore everything else silently so
  // Square keeps sending us events without retrying on 4xx.
  if (eventType !== "payment.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    const data = event.data as Record<string, unknown> | undefined;
    const object = data?.object as Record<string, unknown> | undefined;
    const payment = object?.payment as Record<string, unknown> | undefined;

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    const squarePaymentId = payment.id as string | undefined;
    const referenceId = payment.reference_id as string | undefined; // our order UUID
    const status = payment.status as string | undefined;

    if (!squarePaymentId || !referenceId || status !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    // Look up the order by our reference ID (set when we created the payment).
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, referenceId))
      .limit(1);

    if (!order) {
      // Order not found — could be a test payment or a race with a deleted row.
      // Return 200 so Square doesn't retry endlessly.
      Sentry.captureMessage(`Square webhook: order not found for referenceId ${referenceId}`, "warning");
      return NextResponse.json({ received: true });
    }

    // Only update if the order isn't already marked paid — prevents a duplicate
    // webhook from overwriting a later status like "booked".
    if (order.status === "pending_payment") {
      const amountPaidCents = payment.amount_money as { amount?: number } | undefined;

      await db
        .update(orders)
        .set({
          status: "pending_booking",
          squarePaymentId,
          amountPaidCents: amountPaidCents?.amount ?? order.depositAmountCents,
          paidAt: new Date(),
        })
        .where(eq(orders.id, referenceId));
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "webhooks/square" } });
    // Return 500 so Square retries delivery — we want to recover missed updates.
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
