import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { SquareClient, SquareEnvironment, SquareError } from "square";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  const sourceId = body?.sourceId as string | undefined;

  if (!orderId || !sourceId) {
    return NextResponse.json(
      { error: "Missing orderId or sourceId" },
      { status: 400 },
    );
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const env = process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

  if (!accessToken || !locationId) {
    return NextResponse.json(
      { error: "Payments are not configured on the server yet." },
      { status: 503 },
    );
  }

  let order;
  try {
    [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  } catch (err) {
    // Database unreachable (e.g. paused Supabase project). Fail with a clear
    // message rather than a bodyless 500 so the buyer knows it's not their card.
    console.error("[payments] failed to load order — database error:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't reach our system to process your payment. Your card was not charged — please try again shortly.",
      },
      { status: 503 },
    );
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If a payment already succeeded for this order, don't double-charge.
  if (order.status === "paid" || order.status === "pending_booking" || order.status === "booked") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const amountCents =
    order.paymentType === "full" ? order.totalAmountCents : order.depositAmountCents;

  const client = new SquareClient({ token: accessToken, environment: env });

  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(amountCents),
        currency: "USD",
      },
      locationId,
      referenceId: order.id,
      note: `Petals by Dar — ${order.paymentType === "full" ? "full payment" : "deposit"} for ${order.customerName}`,
      buyerEmailAddress: order.email,
    });

    const payment = response.payment;
    if (!payment || payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment status: ${payment?.status ?? "unknown"}` },
        { status: 402 },
      );
    }

    await db
      .update(orders)
      .set({
        status: "pending_booking",
        squarePaymentId: payment.id ?? null,
        amountPaidCents: amountCents,
        paidAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    return NextResponse.json({ ok: true, paymentId: payment.id });
  } catch (err) {
    if (err instanceof SquareError) {
      const detail = err.body as { errors?: Array<{ detail?: string }> } | undefined;
      const message =
        detail?.errors?.[0]?.detail ?? err.message ?? "Square rejected the payment.";
      return NextResponse.json({ error: message }, { status: 402 });
    }
    console.error("payment failed", err);
    return NextResponse.json(
      { error: "Payment failed unexpectedly. Please try again." },
      { status: 500 },
    );
  }
}
