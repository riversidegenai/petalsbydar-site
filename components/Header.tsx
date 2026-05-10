"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const inOrderFlow = pathname?.startsWith("/order") ?? false;

  return (
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
            <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
              <Link href="/#bouquets" className="hover:text-blush-700">Bouquets</Link>
              <Link href="/#gallery" className="hover:text-blush-700">Gallery</Link>
              <Link href="/#about" className="hover:text-blush-700">About</Link>
            </nav>
            <Link href="/order" className="btn-primary px-5 py-2 text-sm">Order</Link>
          </>
        )}
      </div>
    </header>
  );
}
