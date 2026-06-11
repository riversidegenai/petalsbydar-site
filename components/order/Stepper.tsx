type Step = "service" | "details" | "payment" | "booking";

const STEPS: { id: Step; label: string }[] = [
  { id: "service", label: "Service" },
  { id: "details", label: "Details" },
  { id: "payment", label: "Payment" },
  { id: "booking", label: "Booking" },
];

export default function Stepper({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  const progress = STEPS.length > 1 ? idx / (STEPS.length - 1) : 0;

  return (
    <div className="relative">
      {/* Connecting track — a soft line behind the dots that fills with blush
          as the customer advances, giving a clear sense of momentum. */}
      <div className="pointer-events-none absolute left-0 right-0 top-[14px] hidden px-[7%] sm:block">
        <div className="relative h-0.5 rounded-full bg-blush-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blush-500 transition-[width] duration-700 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <ol className="relative flex items-start justify-between gap-1 text-xs sm:gap-3">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={s.id} className="flex flex-1 flex-col items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ring-4 ring-[var(--bg)] transition-all duration-300 ${
                  done
                    ? "bg-blush-700 text-white"
                    : active
                      ? "scale-110 bg-blush-600 text-white shadow-glow"
                      : "bg-blush-100 text-blush-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-center text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "text-blush-900"
                    : done
                      ? "text-blush-700"
                      : "text-blush-400"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
