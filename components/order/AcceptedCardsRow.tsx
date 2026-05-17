// Inline brand marks kept intentionally compact — silhouettes/wordmarks
// in muted blush tones to match the rest of the checkout instead of the
// loud official multi-color logos.
const STROKE = "#9C4761"; // blush-700

function Visa() {
  return (
    <svg viewBox="0 0 64 22" className="h-5 w-auto">
      <text
        x="32"
        y="17"
        textAnchor="middle"
        fontFamily="ui-serif, Georgia, serif"
        fontSize="20"
        fontStyle="italic"
        fontWeight="700"
        fill={STROKE}
        letterSpacing="1"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 40 24" className="h-5 w-auto" fill="none">
      <circle cx="15" cy="12" r="9" fill={STROKE} opacity="0.85" />
      <circle cx="25" cy="12" r="9" fill={STROKE} opacity="0.45" />
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 64 22" className="h-5 w-auto">
      <text
        x="32"
        y="16"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="800"
        fill={STROKE}
        letterSpacing="0.5"
      >
        AMEX
      </text>
    </svg>
  );
}

function Discover() {
  return (
    <svg viewBox="0 0 80 22" className="h-5 w-auto">
      <text
        x="40"
        y="16"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill={STROKE}
        letterSpacing="0.4"
      >
        DISCOVER
      </text>
      <circle cx="68" cy="12" r="3" fill={STROKE} opacity="0.65" />
    </svg>
  );
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 60 22" className="h-5 w-auto" fill={STROKE}>
      <path d="M9.5 6.6c.5-.6.9-1.5.7-2.4-.8 0-1.7.5-2.3 1.2-.5.6-1 1.5-.8 2.3.9.1 1.8-.4 2.4-1.1zm.7.9c-1.3-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.5-.4 6.1.9 8.1.7 1 1.5 2.1 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0-.1-2.2-.8-2.2-3.3 0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-2.8-1.6z" />
      <text
        x="18"
        y="16"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="600"
        fill={STROKE}
      >
        Pay
      </text>
    </svg>
  );
}

function CashAppMark() {
  return (
    <svg viewBox="0 0 64 22" className="h-5 w-auto">
      <text
        x="0"
        y="16"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill={STROKE}
      >
        Cash App
      </text>
    </svg>
  );
}

const MARKS = [
  { key: "visa", Component: Visa },
  { key: "mc", Component: Mastercard },
  { key: "amex", Component: Amex },
  { key: "disc", Component: Discover },
  { key: "apple", Component: ApplePayMark },
  { key: "cashapp", Component: CashAppMark },
];

export default function AcceptedCardsRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-1">
      {MARKS.map(({ key, Component }) => (
        <div key={key} className="opacity-80">
          <Component />
        </div>
      ))}
    </div>
  );
}
