import FAQ from "@/components/FAQ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Petals by Dar",
  description:
    "Answers to the most common questions about ordering, pickup, delivery, pricing, and add-ons at Petals by Dar.",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <FAQ />
    </main>
  );
}
