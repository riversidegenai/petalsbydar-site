"use client";

import { rollingPickupDates } from "@/lib/pickup-dates";

export default function DateChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const dates = rollingPickupDates();
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <div className="flex gap-2">
        {dates.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => onChange(d.iso)}
            className={value === d.iso ? "chip-active" : "chip"}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
