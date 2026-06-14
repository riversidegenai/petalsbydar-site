"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BOUQUETS, type BouquetId } from "@/lib/bouquets";

export default function BouquetSelector() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get("bouquet") as BouquetId) || "custom";
  const [selected, setSelected] = useState<BouquetId>(initial);

  function onContinue() {
    router.push(`/order/details?bouquet=${selected}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {BOUQUETS.map((b) => {
          const active = selected === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(b.id)}
              className={`text-left transition ${active ? "card-pink-active" : "card-pink hover:border-blush-400"}`}
            >
              <h3 className="serif text-xl">{b.name}</h3>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">{b.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="pill">Tell us what you want</span>
                {active && <span className="text-xs font-medium text-blush-700">Selected ✓</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button onClick={onContinue} className="btn-primary">Continue →</button>
      </div>
    </div>
  );
}
