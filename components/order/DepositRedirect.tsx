"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type PaymentType = "deposit" | "full";

type OrderSummary = {
  totalAmountCents: number;
  depositAmountCents: number;
};

function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function DepositRedirect() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const cancelled = params.get("cancelled");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<PaymentType | null>(null);
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!orderId) return;
    void (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) return;
        const data = (await res.json()) as OrderSummary;
        setSummary(data);
      } catch {
        // leave summary null; we'll fall back below
      }
    })();
  }, [orderId]);

  async function start(paymentType: PaymentType) {
    if (!orderId) {
      setErr("Missing order. Start over from the order page.");
      return;
    }
    setBusy(paymentType);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, paymentType }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start checkout.");
      setBusy(null);
    }
  }

  const depositLabel = summary ? formatUSD(summary.depositAmountCents) : "—";
  const totalLabel = summary ? formatUSD(summary.totalAmountCents) : "—";

  return (
    <div className="space-y-4">
      {cancelled && !err && (
        <p className="text-sm text-blush-700">
          No worries — your spot isn&apos;t lost. Pick an option below to lock it in.
        </p>
      )}
      {err && <p className="text-sm text-red-600">{err}</p>}

      <p className="text-sm text-ink-soft">
        Choose how you&apos;d like to pay.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => start("deposit")}
          disabled={busy !== null || !summary}
          className={`text-left transition hover:shadow-glow disabled:opacity-50 ${
            busy === "deposit" ? "card-pink-active" : "card-pink"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
            Pay a deposit
          </p>
          <p className="serif mt-2 text-3xl">{depositLabel}</p>
          <p className="mt-2 text-xs text-blush-700">
            Secures your bouquet · Remainder due at pickup
          </p>
          <span className="btn-primary mt-5 w-full justify-center">
            {busy === "deposit" ? "Loading…" : "Pay deposit →"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => start("full")}
          disabled={busy !== null || !summary}
          className={`text-left transition hover:shadow-glow disabled:opacity-50 ${
            busy === "full" ? "card-pink-active" : "card-pink"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
            Pay in full
          </p>
          <p className="serif mt-2 text-3xl">{totalLabel}</p>
          <p className="mt-2 text-xs text-blush-700">
            Nothing owed at pickup · Done in one step
          </p>
          <span className="btn-primary mt-5 w-full justify-center">
            {busy === "full" ? "Loading…" : "Pay in full →"}
          </span>
        </button>
      </div>
    </div>
  );
}
