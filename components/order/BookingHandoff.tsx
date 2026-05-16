"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { squareBookingUrl } from "@/lib/square";

export default function BookingHandoff() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const bookingUrl = squareBookingUrl();

  return (
    <div className="space-y-6">
      <div className="card-pink">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blush-700">
          Payment received
        </p>
        <p className="serif mt-1 text-3xl">Thank you!</p>
        <p className="mt-2 text-sm text-blush-800">
          Your card has been charged. Last step — pick a pickup time with Dar.
        </p>
      </div>

      <div className="rounded-2xl border border-blush-200 bg-white/70 p-5 text-sm text-ink-soft">
        <p className="serif text-lg text-ink">Book your pickup time</p>
        <p className="mt-2">
          You&apos;ll be sent to Petals by Dar&apos;s Square booking page in a
          new tab. Pick a time that works for you — Dar will confirm the order
          on her end.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xs text-blush-700 underline hover:text-blush-900">
          ← Back to home
        </Link>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open Square booking →
        </a>
      </div>

      {orderId && (
        <p className="text-[11px] text-ink-soft">Order reference: {orderId}</p>
      )}
    </div>
  );
}
