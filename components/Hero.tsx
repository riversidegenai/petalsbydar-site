import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="pill">Woodburn, Oregon</span>
            <span className="pill">Pickup &amp; local delivery</span>
          </div>
          <h1 className="serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
            Petals <span className="italic-accent">by</span> Dar
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
            Eternal bouquets, hand-made for every occasion — bouquets that last as long as the moment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/order" className="btn-primary">Order a bouquet →</Link>
            <Link href="#gallery" className="btn-secondary">See bouquets</Link>
          </div>
          <p className="mt-4 text-xs text-blush-700">
            Deposits secure your bouquet · Remainder paid at pickup
          </p>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-blush-200 shadow-glow md:aspect-[5/6]">
            <Image
              src="/gallery/IMG_3101.jpg"
              alt="A custom bouquet by Petals by Dar"
              fill
              priority
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 rounded-2xl bg-white/95 px-5 py-3 shadow-card backdrop-blur">
            <span className="pill text-[10px]">Now taking orders</span>
          </div>
        </div>
      </div>
    </section>
  );
}
