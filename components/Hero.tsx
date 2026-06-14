import Link from "next/link";
import Image from "next/image";
import FallingPetals from "@/components/FallingPetals";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20">
      {/* Gentle petals, scoped to the hero only — atmosphere at the top of the
          page that's gone by the time you reach the flowers. */}
      <FallingPetals count={12} />
      {/* Plush pink bloom — a soft, layered rose haze behind the hero that gives
          the section depth and a velvety "plush" warmth without overpowering the
          settled palette. Pointer-events off; sits behind all content.
          (Body has overflow-x:hidden so the oversized bloom never causes
          horizontal scroll on mobile while decorative overhangs still show.) */}
      <div
        aria-hidden
        className="hero-bloom pointer-events-none absolute -top-10 left-1/2 -z-10 h-[120%] w-[140%] -translate-x-1/2"
      />
      <div className="relative z-10 grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <div className="reveal mb-6 flex flex-wrap gap-2">
            <span className="pill">Woodburn, Oregon</span>
            <span className="pill">Pickup &amp; local delivery</span>
          </div>
          <h1 className="reveal serif text-5xl leading-[1.05] tracking-tight md:text-6xl" style={{ animationDelay: "80ms" }}>
            Petals <span className="italic-accent">by</span> Dar
          </h1>
          <p className="reveal mt-5 max-w-md text-base leading-relaxed text-ink-soft" style={{ animationDelay: "180ms" }}>
            Eternal bouquets, hand-made for every occasion — bouquets that last as long as the moment.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
            <Link href="/order" className="btn-primary">Order a bouquet →</Link>
            <Link href="#gallery" className="btn-secondary">See bouquets</Link>
          </div>
          <p className="reveal mt-4 text-xs text-blush-700" style={{ animationDelay: "360ms" }}>
            Tell us your vision · Share your inspiration · Made just for you
          </p>
        </div>

        <div className="reveal relative" style={{ animationDelay: "200ms" }}>
          {/* Breathing botanical glow — gives the hero image a living, organic
              halo rather than sitting on a flat background. */}
          <div className="breathe pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(closest-side,rgba(216,58,106,0.5),rgba(244,138,163,0.28)_55%,transparent_75%)]" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-blush-200 shadow-glow md:aspect-[5/6]">
            <Image
              src="/gallery/IMG_3101.jpg"
              alt="A custom bouquet by Petals by Dar"
              fill
              priority
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.04]"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 rounded-2xl bg-white/95 px-5 py-3 shadow-card backdrop-blur">
            <span className="pill text-[10px]">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blush-500" />
              Now taking orders
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
