"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How does pricing work?",
    a: "Pricing is based on the number of roses plus any add-ons you choose — things like personalized banners, butterfly accents, flower crowns, glitter, or a plushie. If you'd like delivery, that's charged separately based on distance (more below).\n\n1 rose — $7 · 7 roses — $30 · 12 roses — $40 · 18 roses — $70 · 25 roses — $105 · 50 roses — $210",
  },
  {
    q: "What are the pickup times?",
    a: "Pickup is available in two windows: 6 am – 4 pm or 6 pm – 11 pm. Just let Dar know which window works best for you when you place your order.",
  },
  {
    q: "Do you offer delivery?",
    a: "Yes! Delivery is available 9 am – 11 am and 5 pm – 9 pm. The delivery fee depends on how far you are — nearby orders are $5–$10, and farther locations are $15–$25.",
  },
  {
    q: "What add-ons are available?",
    a: "You can personalize your bouquet with: a custom banner (+$5), a flower crown (+$12), butterfly accents (+$0.50 each), glitter (+$5), or a plushie (+$15). Mix and match as many as you like!",
  },
  {
    q: "Do I pay the full amount upfront?",
    a: "A 50% deposit is collected when you place your order to reserve your bouquet. The remaining balance is due at pickup or delivery.",
  },
  {
    q: "How far in advance should I order?",
    a: "The earlier the better — especially around holidays like Valentine's Day and Mother's Day when Dar gets very busy. Rush orders are available for an extra $15 fee, subject to availability.",
  },
  {
    q: "Is there a holiday surcharge?",
    a: "Yes, a $30 holiday surcharge applies for major holidays like Valentine's Day and Mother's Day. This reflects the extra demand and care that goes into each order during peak seasons.",
  },
  {
    q: "What payments do you accept?",
    a: "Cash App, Zelle, Apple Pay, and cash.",
  },
  {
    q: "What's the latest I can order a bouquet?",
    a: "For eternal rose bouquets, Dar typically asks for 4–5 days notice. From time to time she can make one the night before, but a rush fee applies for late-notice orders. For bouquets made from natural/fresh roses, a full week of notice is preferred — two weeks is even better. Please keep in mind that Dar can never be 100% certain she can fulfill a natural rose bouquet ordered the night or day before you need it. A late fee applies to both eternal and natural rose orders when placed on short notice.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-24 px-6 py-20">
      <div className="mb-10 text-center">
        <span className="pill">FAQ</span>
        <h2 className="serif mt-4 text-3xl text-ink md:text-4xl">
          Questions? Dar&apos;s got answers.
        </h2>
        <p className="mt-3 text-sm text-ink-soft">
          Everything you need to know before placing your order.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-blush-200 bg-white/75 shadow-card backdrop-blur transition-all"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-ink">{faq.q}</span>
                <span
                  className={`flex-shrink-0 text-blush-500 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>

              <div
                className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-blush-100 px-5 py-4 text-sm leading-relaxed text-ink-soft">
                    {faq.a.split("\n\n").map((part, j) => (
                      <p key={j} className={j > 0 ? "mt-3" : ""}>
                        {part}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Still have questions?{" "}
        <a
          href="mailto:petalsbydar@gmail.com"
          className="text-blush-600 underline underline-offset-2 hover:text-blush-800"
        >
          Message Dar directly
        </a>
        {" "}or use the chat bubble below.
      </p>
    </section>
  );
}
