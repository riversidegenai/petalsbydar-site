type Step = "service" | "details" | "payment" | "booking";

const STEPS: { id: Step; label: string }[] = [
  { id: "service", label: "Service" },
  { id: "details", label: "Details" },
  { id: "payment", label: "Payment" },
  { id: "booking", label: "Booking" },
];

export default function Stepper({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap items-center gap-3 text-xs">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s.id} className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                active
                  ? "border-blush-600 bg-blush-50 text-blush-900"
                  : done
                    ? "border-blush-300 bg-blush-100/60 text-blush-800"
                    : "border-blush-100 bg-white/70 text-blush-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  done
                    ? "bg-blush-700 text-white"
                    : active
                      ? "bg-blush-600 text-white"
                      : "bg-blush-100 text-blush-500"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="font-medium uppercase tracking-[0.14em]">{s.label}</span>
            </span>
            {i < STEPS.length - 1 && (
              <span className="hidden h-px w-8 border-t border-dashed border-blush-300 sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
