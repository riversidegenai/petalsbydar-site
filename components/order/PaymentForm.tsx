"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { payments, type Card, type Payments } from "@square/web-sdk";
import { formatPrice } from "@/lib/gallery";
import { squareBookingUrl } from "@/lib/square";

type OrderSummary = {
  id: string;
  customerName: string;
  totalAmountCents: number;
  depositAmountCents: number;
  paymentType: "deposit" | "full";
  galleryStyle: string | null;
  status: string;
};

export default function PaymentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [card, setCard] = useState<Card | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Fetch order summary so we can show what they're paying for.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load your order.");
        const data = (await res.json()) as OrderSummary;
        if (!cancelled) setOrder({ ...data, id: orderId });
      })
      .catch((e) => {
        if (!cancelled) setOrderError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Initialize Square Web Payments SDK once.
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!appId || !locationId) {
      setSdkError(
        "Payment processing is not configured yet. Please contact Petals by Dar.",
      );
      return;
    }

    let attachedCard: Card | null = null;
    let cancelled = false;

    (async () => {
      try {
        const paymentsInstance: Payments | null = await payments(appId, locationId);
        if (!paymentsInstance) throw new Error("Square Web Payments SDK failed to load.");
        const newCard = await paymentsInstance.card();
        if (cancelled) return;
        if (!cardContainerRef.current) return;
        await newCard.attach(cardContainerRef.current);
        attachedCard = newCard;
        setCard(newCard);
        setSdkReady(true);
      } catch (e) {
        if (!cancelled) {
          setSdkError(
            e instanceof Error
              ? e.message
              : "Could not load the payment form. Please refresh.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (attachedCard) {
        attachedCard.destroy().catch(() => {});
      }
    };
  }, []);

  async function onPay() {
    if (!card || !order) return;
    setSubmitting(true);
    setPayError(null);
    try {
      const result = await card.tokenize();
      if (result.status !== "OK" || !result.token) {
        const firstError =
          "errors" in result && result.errors && result.errors.length > 0
            ? result.errors[0]
            : null;
        const message =
          firstError && "message" in firstError
            ? firstError.message
            : "Card could not be verified.";
        throw new Error(message);
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: order.id, sourceId: result.token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Payment could not be processed.");
      }

      // Hand off to Square Appointments for pickup-time selection.
      window.location.href = `/order/booking?orderId=${order.id}`;
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed.");
      setSubmitting(false);
    }
  }

  if (orderError) {
    return <p className="text-sm text-red-600">{orderError}</p>;
  }
  if (!order) {
    return <p className="text-sm text-ink-soft">Loading your order…</p>;
  }

  const amountCents =
    order.paymentType === "full" ? order.totalAmountCents : order.depositAmountCents;
  const remainderCents =
    order.paymentType === "full" ? 0 : order.totalAmountCents - order.depositAmountCents;

  return (
    <div className="space-y-6">
      <div className="card-pink">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
          {order.paymentType === "full" ? "Paying in full" : "Paying deposit"}
        </p>
        <p className="serif mt-1 text-3xl">{formatPrice(amountCents)}</p>
        {remainderCents > 0 && (
          <p className="mt-1 text-xs text-blush-700">
            {formatPrice(remainderCents)} remainder at pickup
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-blush-200 bg-white/70 p-5">
        <p className="label">Card details</p>
        {sdkError ? (
          <p className="text-sm text-red-600">{sdkError}</p>
        ) : (
          <div ref={cardContainerRef} className="mt-2 min-h-[60px]" />
        )}
      </div>

      {payError && <p className="text-sm text-red-600">{payError}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onPay}
          disabled={!sdkReady || submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting
            ? "Processing…"
            : `Pay ${formatPrice(amountCents)} →`}
        </button>
      </div>

      <p className="text-[11px] text-ink-soft">
        After payment, you&apos;ll be sent to Square Appointments to pick your
        pickup time. Booking URL:{" "}
        <span className="break-all">{squareBookingUrl()}</span>
      </p>
    </div>
  );
}
