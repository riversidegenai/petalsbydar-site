"use client";

const PETALS = Array.from({ length: 40 }, (_, i) => {
  const left = (i * 37) % 100;
  const delay = (i * 0.9) % 16;
  const duration = 14 + ((i * 3) % 14);
  const size = 32 + ((i * 5) % 32);
  const drift = ((i % 2 === 0 ? 1 : -1) * (20 + ((i * 7) % 80)));
  const hue = i % 3 === 0 ? "#f48aa3" : i % 3 === 1 ? "#f8b6c5" : "#ec5e84";
  const opacity = 0.55 + ((i % 5) * 0.09);
  return { left, delay, duration, size, drift, hue, opacity, id: i };
});

export default function FloatingPetals() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55vh] overflow-hidden"
    >
      {PETALS.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
            ["--size" as string]: `${p.size}px`,
            ["--hue" as string]: p.hue,
            ["--opacity" as string]: p.opacity,
          }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
            <path d="M12 2c2.5 3 5 6 5 9a5 5 0 1 1-10 0c0-3 2.5-6 5-9z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
