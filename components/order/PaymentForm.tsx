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
  customerFirstName: string;
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
  const [reloadKey, setReloadKey] = useState(0);

  const [card, setCard] = useState<Card | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Fetch order summary so we can show what they're paying for. Re-runs when
  // reloadKey changes so the customer can retry a transient failure instead of
  // hitting a dead end at the moment they're trying to pay.
  useEffect(() => {
    let cancelled = false;
    setOrderError(null);
    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "We couldn't find this order. It may have expired — please start your order again."
              : "We couldn't load your order right now. Please try again in a moment.",
          );
        }
        const data = (await res.json()) as OrderSummary;
        if (!cancelled) setOrder({ ...data, id: orderId });
      })
      .catch((e) => {
        if (!cancelled) setOrderError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, reloadKey]);

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
        } catch (err) {
          // Apple Pay unavailable (unsupported browser/device, or init threw).
          // Log so we can tell "correctly hidden" from "broke unexpectedly".
          console.error("[PaymentForm] Apple Pay init failed:", err);
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
        } catch (err) {
          // Cash App Pay unavailable — log so a failing init/attach is visible
          // in the browser console instead of silently hiding the button.
          console.error("[PaymentForm] Cash App Pay init/attach failed:", err);
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
    return (
      <div className="rounded-3xl border border-blush-200 bg-white/75 p-6 shadow-card backdrop-blur">
        <p className="serif text-lg text-ink">We hit a snag loading your order</p>
        <p className="mt-2 text-sm text-ink-soft">{orderError}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/order" className="btn-secondary">
            Start over
          </a>
        </div>
        <p className="mt-4 text-[11px] text-ink-soft">
          If this keeps happening, message Dar at{" "}
          <a href="mailto:petalsbydar@gmail.com" className="underline">
            petalsbydar@gmail.com
          </a>{" "}
          and your bouquet will be held.
        </p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        Loading your order…
      </div>
    );
  }

  const amountCents =
    order.paymentType === "full" ? order.totalAmountCents : order.depositAmountCents;
  const remainderCents =
    order.paymentType === "full" ? 0 : order.totalAmountCents - order.depositAmountCents;

  const payingFull = order.paymentType === "full";

  return (
    <div className="space-y-5">
      {/* Receipt-style order summary — names what they're buying and breaks the
          amounts down clearly so there are no surprises before they pay. */}
      <div className="reveal overflow-hidden rounded-3xl border border-blush-200 bg-white/75 shadow-card backdrop-blur">
        <div className="border-b border-blush-100 bg-gradient-to-br from-blush-50 to-white px-6 py-4">
          <p className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blush-700">
              Your order
            </span>
          </p>
          <p className="serif mt-1 text-lg text-ink">
            Bouquet for {order.customerFirstName}
          </p>
        </div>

        <dl className="space-y-2.5 px-6 py-5 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">Bouquet total</dt>
            <dd className="font-medium text-ink">
              {formatPrice(order.totalAmountCents)}
            </dd>
          </div>
          {!payingFull && (
            <div className="flex items-baseline justify-between text-ink-soft">
              <dt>Remainder at pickup</dt>
              <dd>{formatPrice(remainderCents)}</dd>
            </div>
          )}
          <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-blush-200 pt-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
              {payingFull ? "Paying now, in full" : "Deposit due now"}
            </dt>
            <dd className="serif text-3xl text-ink">{formatPrice(amountCents)}</dd>
          </div>
        </dl>

        {!payingFull && (
          <p className="border-t border-blush-100 bg-blush-50/50 px-6 py-3 text-center text-[11px] text-blush-700">
            Your deposit reserves your bouquet · pay the rest when you pick it up
          </p>
        )}
      </div>

      {/* Unified payment card */}
      <div className="reveal rounded-3xl border border-blush-200 bg-white/75 p-6 shadow-card backdrop-blur" style={{ animationDelay: "90ms" }}>
        {/* Secure header — quiet trust signal at the top of the pay box. */}
        <div className="mb-5 flex items-center justify-between">
          <p className="serif text-xl text-ink">Checkout</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blush-700">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure checkout
          </span>
        </div>

        {sdkError ? (
          <p className="text-sm text-red-700">{sdkError}</p>
        ) : (
          <div className="space-y-5">
            {/* Wallets — fastest path, presented first. Each constrained to the
                same width/height for alignment. Square renders the official
                branded button inside; we just give them a consistent shell. */}
            <div className="mx-auto w-full max-w-sm space-y-2.5">
              <div
                ref={applePayButtonRef}
                id="apple-pay-button"
                className="apple-pay-button h-12 w-full"
              />
              <div ref={cashAppButtonRef} id="cash-app-pay-button" />
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
                className="mt-2 min-h-[60px] rounded-xl border border-blush-200 bg-white px-3 py-2 transition focus-within:border-blush-500 focus-within:ring-2 focus-within:ring-blush-200"
              />
            </div>

            {payError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {payError}
              </p>
            )}

            <button
              type="button"
              onClick={onPayCard}
              disabled={!sdkReady || submitting}
              className="btn-primary w-full py-4 text-base disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processing…
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Pay {formatPrice(amountCents)}
                </span>
              )}
            </button>

            <AcceptedCardsRow />

            {/* Reassurance row — the cluster of small trust signals that nudge
                hesitant buyers over the line. */}
            <div className="trust-row border-t border-blush-100 pt-4">
              <span className="trust-item">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                256-bit encrypted
              </span>
              <span className="trust-item">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Powered by Square
              </span>
              <span className="trust-item">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Handcrafted to order
              </span>
            </div>
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
