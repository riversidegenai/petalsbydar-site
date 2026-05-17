"use client";

import { useEffect, useRef, useState } from "react";
import {
  payments,
  type ApplePay,
  type Card,
  type CashAppPay,
  type Payments,
  type PaymentRequest,
} from "@square/web-sdk";
import { formatPrice } from "@/lib/gallery";
import AcceptedCardsRow from "./AcceptedCardsRow";

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
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const applePayButtonRef = useRef<HTMLDivElement | null>(null);
  const cashAppButtonRef = useRef<HTMLDivElement | null>(null);

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

  // Initialize Square Web Payments SDK once we have the order amount.
  useEffect(() => {
    if (!order) return;

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!appId || !locationId) {
      setSdkError(
        "Payment processing is not configured yet. Please contact Petals by Dar.",
      );
      return;
    }

    const amountCents =
      order.paymentType === "full" ? order.totalAmountCents : order.depositAmountCents;
    const amountDollars = (amountCents / 100).toFixed(2);

    let attachedCard: Card | null = null;
    let attachedApplePay: ApplePay | null = null;
    let attachedCashApp: CashAppPay | null = null;
    let cancelled = false;

    (async () => {
      try {
        const paymentsInstance: Payments | null = await payments(appId, locationId);
        if (!paymentsInstance) throw new Error("Square Web Payments SDK failed to load.");

        // --- Card ---
        const newCard = await paymentsInstance.card();
        if (cancelled) return;
        if (cardContainerRef.current) {
          await newCard.attach(cardContainerRef.current);
          attachedCard = newCard;
          setCard(newCard);
        }

        // Build one shared payment request for all wallets.
        const buildRequest = (): PaymentRequest =>
          paymentsInstance.paymentRequest({
            countryCode: "US",
            currencyCode: "USD",
            total: { amount: amountDollars, label: "Petals by Dar" },
          });

        // --- Apple Pay (Safari + verified domain only) ---
        try {
          const applePay = await paymentsInstance.applePay(buildRequest());
          if (cancelled) return;
          if (applePayButtonRef.current) {
            attachedApplePay = applePay;
            applePayButtonRef.current.addEventListener("click", async () => {
              await handleWalletTokenize(applePay, "Apple Pay");
            });
            applePayButtonRef.current.dataset.ready = "true";
          }
        } catch {
          // Apple Pay unavailable — hide the button silently.
        }

        // --- Cash App Pay ---
        try {
          const cashAppPay = await paymentsInstance.cashAppPay(buildRequest(), {
            redirectURL: window.location.href,
            referenceId: orderId,
          });
          if (cancelled) return;
          if (cashAppButtonRef.current) {
            await cashAppPay.attach(cashAppButtonRef.current);
            attachedCashApp = cashAppPay;
            cashAppPay.addEventListener("ontokenization", async (event) => {
              const detail = (event as CustomEvent<{ tokenResult: { status: string; token?: string } }>).detail;
              const tokenResult = detail?.tokenResult;
              if (tokenResult?.status === "OK" && tokenResult.token) {
                await chargeServer(tokenResult.token, "Cash App Pay");
              }
            });
            cashAppButtonRef.current.dataset.ready = "true";
          }
        } catch {
          // Cash App Pay unavailable.
        }

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
      attachedCard?.destroy().catch(() => {});
      attachedApplePay?.destroy().catch(() => {});
      attachedCashApp?.destroy().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  async function handleWalletTokenize(
    wallet: ApplePay,
    label: string,
  ) {
    setSubmitting(true);
    setPayError(null);
    try {
      const result = await wallet.tokenize();
      if (result.status !== "OK" || !result.token) {
        const firstError =
          "errors" in result && result.errors && result.errors.length > 0
            ? result.errors[0]
            : null;
        const message =
          firstError && "message" in firstError
            ? firstError.message
            : `${label} was cancelled or failed.`;
        throw new Error(message);
      }
      await chargeServer(result.token, label);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : `${label} failed.`);
      setSubmitting(false);
    }
  }

  async function chargeServer(sourceId: string, _method: string) {
    if (!order) return;
    setSubmitting(true);
    setPayError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: order.id, sourceId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Payment could not be processed.");
      }
      window.location.href = `/order/booking?orderId=${order.id}`;
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed.");
      setSubmitting(false);
    }
  }

  async function onPayCard() {
    if (!card) return;
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
      await chargeServer(result.token, "Card");
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
      {/* Order summary band */}
      <div className="card-pink flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
            {order.paymentType === "full" ? "Paying in full" : "Paying deposit"}
          </p>
          <p className="serif mt-1 text-3xl">{formatPrice(amountCents)}</p>
        </div>
        {remainderCents > 0 && (
          <p className="text-xs text-blush-700">
            <span className="serif text-base">{formatPrice(remainderCents)}</span>{" "}
            remainder at pickup
          </p>
        )}
      </div>

      {/* Unified payment card */}
      <div className="rounded-3xl border border-blush-200 bg-white/70 p-6 shadow-card backdrop-blur">
        {sdkError ? (
          <p className="text-sm text-red-700">{sdkError}</p>
        ) : (
          <div className="space-y-5">
            {/* Wallets — each constrained to the same width/height for alignment.
                Square renders the official branded button inside; we just give
                them a consistent shell. */}
            <div className="space-y-2.5">
              <div
                ref={applePayButtonRef}
                id="apple-pay-button"
                className="apple-pay-button mx-auto h-12 w-full max-w-sm overflow-hidden rounded-xl"
              />
              <div
                ref={cashAppButtonRef}
                id="cash-app-pay-button"
                className="mx-auto h-12 w-full max-w-sm overflow-hidden rounded-xl [&>div]:!h-full [&>div]:!w-full [&_button]:!h-full [&_button]:!w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-blush-200" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blush-700">
                Or pay with card
              </span>
              <span className="h-px flex-1 bg-blush-200" />
            </div>

            <div>
              <p className="label">Card details</p>
              <div
                ref={cardContainerRef}
                className="mt-2 min-h-[60px] rounded-xl border border-blush-200 bg-white px-3 py-2"
              />
            </div>

            {payError && <p className="text-sm text-red-600">{payError}</p>}

            <button
              type="button"
              onClick={onPayCard}
              disabled={!sdkReady || submitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? "Processing…" : `Pay ${formatPrice(amountCents)} →`}
            </button>

            <AcceptedCardsRow />
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-ink-soft">
        After payment, you&apos;ll be sent to Square Appointments to pick your
        pickup time.
      </p>
    </div>
  );
}
