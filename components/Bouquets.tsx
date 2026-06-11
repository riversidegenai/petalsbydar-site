"use client";

import Link from "next/link";
import { useState } from "react";
import { BOUQUETS, formatUSD } from "@/lib/bouquets";

export default function Bouquets() {
  const [pressed, setPressed] = useState<string | null>(null);

  return (
    <section id="bouquets" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
      <div className="mb-12">
        <span className="pill mb-5">Bouquets</span>
        <h2 className="serif text-4xl leading-tight md:text-5xl">
          Hand-made, made-to-order,
          <br />
          <span className="italic-accent">made for them</span>.
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {BOUQUETS.map((b) => (
          <Link
            key={b.id}
            href={`/order/details?bouquet=${b.id}`}
            onClick={() => setPressed(b.id)}
            className={`group block transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow ${
              pressed === b.id ? "card-pink-active" : "card-pink"
            }`}
          >
            <h3 className="serif text-2xl transition-colors group-hover:text-blush-800">{b.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{b.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="pill">{formatUSD(b.depositCents)} deposit</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blush-800">
                Order
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
