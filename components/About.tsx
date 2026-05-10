import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
      <div className="mb-8 text-center">
        <span className="pill">About</span>
      </div>
      <div className="card relative mx-auto max-w-2xl text-center">
        <span className="absolute -top-4 left-6 text-5xl text-blush-300 select-none">“</span>
        <p className="serif text-xl leading-relaxed text-ink md:text-2xl">
          Petals by Dar is a custom bouquet studio crafting hand-made paper-rose
          and fresh-floral arrangements for birthdays, anniversaries, Mother&apos;s
          Day, graduations, and every quiet little celebration in between. Every
          bouquet is made to order, wrapped with care, and personalized to the
          person receiving it.
        </p>
        <span className="absolute -bottom-6 right-6 rotate-180 text-5xl text-blush-300 select-none">“</span>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-ink-soft">
        <a href="https://instagram.com/petalsbydar" className="pill" aria-label="Instagram @petalsbydar">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          petalsbydar
        </a>
        <a href="mailto:petalsbydar@gmail.com" className="pill">petalsbydar@gmail.com</a>
        <a href="tel:+19712162630" className="pill">(971) 216-2630</a>
      </div>

      <div className="mt-10 text-center">
        <Link href="/order" className="btn-primary">Order your bouquet →</Link>
      </div>
    </section>
  );
}
