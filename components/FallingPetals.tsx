"use client";

import { useEffect, useRef } from "react";

// Calm, hero-scoped petal drift. Rendered ABSOLUTE inside a positioned parent
// (the hero), not fixed to the viewport — so petals live only at the top of the
// page and don't follow you down over the flowers. Fewer petals + slower fall
// than the old site-wide version, so it reads as gentle atmosphere.
//
// Deterministic config (no Math.random) so server/client markup match — no
// hydration mismatch.
function buildPetals(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const left = (i * 61) % 100;
    const delay = (i * 1.3) % 14;
    const baseDuration = 13 + ((i * 4) % 10); // 13–22s, slow drift
    const size = 12 + ((i * 6) % 20); // 12–32px
    const drift = (i % 2 === 0 ? 1 : -1) * (14 + ((i * 9) % 48));
    const spin = 200 + ((i * 41) % 300);
    const hue = i % 3 === 0 ? "#f48aa3" : i % 3 === 1 ? "#f8b6c5" : "#ec5e84";
    const opacity = 0.35 + ((i % 4) * 0.08); // softer than before
    return { left, delay, baseDuration, size, drift, spin, hue, opacity, id: i };
  });
}

export default function FallingPetals({ count = 12 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const petals = buildPetals(count);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const el = containerRef.current;
    if (!el) return;

    let lastY = window.scrollY;
    let ticking = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    function setSpeed(factor: number) {
      el?.style.setProperty("--speed-factor", String(factor));
    }
    setSpeed(1);

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = Math.abs(y - lastY);
        lastY = y;
        // Gentle speed-up only — caps at 0.6× so it never feels frantic.
        const factor = Math.max(0.6, 1 - Math.min(delta, 60) / 150);
        setSpeed(factor);
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => setSpeed(1), 500);
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      // Absolute within the hero (parent is relative). pointer-events-none so it
      // never blocks taps; overflow-hidden so petals can't cause sideways scroll.
      className="petal-fall-layer pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ ["--speed-factor" as string]: 1 }}
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal-fall"
          style={{
            left: `${p.left}%`,
            animationDelay: `-${p.delay}s`,
            ["--fall-duration" as string]: `calc(${p.baseDuration}s * var(--speed-factor, 1))`,
            ["--drift" as string]: `${p.drift}px`,
            ["--spin" as string]: `${p.spin}deg`,
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
