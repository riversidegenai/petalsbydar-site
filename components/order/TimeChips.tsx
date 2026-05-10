"use client";

import { PICKUP_TIMES } from "@/lib/pickup-dates";

export default function TimeChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PICKUP_TIMES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={value === t ? "chip-active" : "chip"}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
