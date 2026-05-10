import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let confirmed = false;
  let paidInFull = false;
  if (session_id && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        confirmed = true;
        paidInFull = session.metadata?.paymentType === "full";
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const [row] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
          if (row && row.status !== "paid") {
            await db
              .update(orders)
              .set({
                status: "paid",
                paidAt: new Date(),
                stripePaymentIntentId:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : (session.payment_intent?.id ?? null),
              })
              .where(eq(orders.id, orderId));
          }
        }
      }
    } catch {
      // fall through with confirmed=false
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blush-100">
        <span className="serif text-3xl text-blush-700">✓</span>
      </div>
      <h1 className="serif text-4xl md:text-5xl">
        {confirmed ? "Bouquet locked in." : "Almost there…"}
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm text-ink-soft">
        {confirmed
          ? paidInFull
            ? "Paid in full. Petals by Dar has been notified and will text you to confirm details. Nothing owed at pickup. A receipt is on its way to your email."
            : "Your deposit is in. Petals by Dar has been notified and will text you to confirm details. Remainder is due at pickup. A receipt is on its way to your email."
          : "We're confirming your payment. If this page doesn't update in a moment, check your email for a receipt — your order is safe either way."}
      </p>
      <div className="mt-10">
        <Link href="/" className="btn-primary">Back to home</Link>
      </div>
    </section>
  );
}
