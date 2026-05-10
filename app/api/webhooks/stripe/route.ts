import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { stripe } from "@/lib/stripe";
import { sendOwnerNotification, sendCustomerReceipt } from "@/lib/email";
import { sendOwnerSms } from "@/lib/sms";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (order && order.status !== "paid") {
        const [updated] = await db
          .update(orders)
          .set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
          })
          .where(eq(orders.id, orderId))
          .returning();
        if (updated) {
          await Promise.allSettled([
            sendOwnerNotification(updated),
            sendCustomerReceipt(updated),
            sendOwnerSms(updated),
          ]);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
