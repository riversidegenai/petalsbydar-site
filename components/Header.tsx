"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const inOrderFlow = pathname?.startsWith("/order") ?? false;
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-blush-100/60 bg-white/60 backdrop-blur">
        <div
          className={`mx-auto flex max-w-6xl items-center px-6 py-4 ${
            inOrderFlow ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            href="/"
            className="serif text-lg tracking-tight hover:text-blush-700 transition"
          >
            Petals by Dar
          </Link>

          {!inOrderFlow && (
            <>
              {/* Desktop nav */}
              <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
                <Link href="/#bouquets" className="hover:text-blush-700">Bouquets</Link>
                <Link href="/gallery" className="hover:text-blush-700">Gallery</Link>
                <Link href="/faq" className="hover:text-blush-700">FAQ</Link>
                <Link href="/#about" className="hover:text-blush-700">About</Link>
              </nav>
              <Link href="/order" className="btn-primary hidden px-5 py-2 text-sm md:inline-flex">Order</Link>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition hover:bg-blush-50 hover:text-blush-700 md:hidden"
              >
                {menuOpen ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {!inOrderFlow && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            className={`fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
              menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          {/* Slide-down panel */}
          <div
            className={`fixed left-0 right-0 top-[65px] z-40 border-b border-blush-100 bg-white/95 backdrop-blur transition-all duration-300 ease-in-out md:hidden ${
              menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
            }`}
          >
            <nav className="flex flex-col px-6 py-4">
              <Link
                href="/#bouquets"
                className="border-b border-blush-50 py-4 text-base font-medium text-ink hover:text-blush-700"
              >
                Bouquets
              </Link>
              <Link
                href="/gallery"
                className="border-b border-blush-50 py-4 text-base font-medium text-ink hover:text-blush-700"
              >
                Gallery
              </Link>
              <Link
                href="/faq"
                className="border-b border-blush-50 py-4 text-base font-medium text-ink hover:text-blush-700"
              >
                FAQ
              </Link>
              <Link
                href="/#about"
                className="border-b border-blush-50 py-4 text-base font-medium text-ink hover:text-blush-700"
              >
                About
              </Link>
              <Link
                href="/order"
                className="btn-primary mt-4 py-3 text-center text-base"
              >
                Order your bouquet →
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
