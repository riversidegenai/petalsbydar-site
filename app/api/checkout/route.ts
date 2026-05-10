import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getBouquet } from "@/lib/bouquets";
import { stripe, siteUrl } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }
  const { orderId, paymentType } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  const type: "deposit" | "full" = paymentType === "full" ? "full" : "deposit";

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const bouquet = getBouquet(order.bouquetType);
  if (!bouquet) {
    return NextResponse.json({ error: "Invalid bouquet on order" }, { status: 400 });
  }

  const isFull = type === "full";
  const amountCents = isFull ? order.totalAmountCents : order.depositAmountCents;
  const styleSuffix = order.galleryStyle ? ` (${order.galleryStyle})` : "";
  const lineLabel = isFull
    ? `${bouquet.name}${styleSuffix} — paid in full`
    : `${bouquet.name}${styleSuffix} — deposit`;
  const lineDescription = isFull
    ? `Paid in full. Pickup on ${order.pickupDate} ${order.pickupTime}.`
    : `Deposit toward ${bouquet.name}${styleSuffix}. Remainder due at pickup on ${order.pickupDate} ${order.pickupTime}.`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "cashapp"],
    customer_email: order.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: lineLabel,
            description: lineDescription,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id, paymentType: type },
    success_url: `${siteUrl()}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/order/deposit?orderId=${order.id}&cancelled=1`,
  });

  await db
    .update(orders)
    .set({ stripeSessionId: session.id })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ url: session.url });
}
