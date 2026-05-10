import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-blush-100 py-10 text-center text-xs text-blush-700">
      <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link href="/legal/privacy" className="hover:text-blush-900">
          Privacy
        </Link>
        <span aria-hidden className="text-blush-300">
          ·
        </span>
        <Link href="/legal/terms" className="hover:text-blush-900">
          Terms
        </Link>
        <span aria-hidden className="text-blush-300">
          ·
        </span>
        <Link href="/legal/refunds" className="hover:text-blush-900">
          Refund Policy
        </Link>
        <span aria-hidden className="text-blush-300">
          ·
        </span>
        <a
          href="mailto:petalsbydar@gmail.com"
          className="hover:text-blush-900"
        >
          Contact
        </a>
      </nav>
      <p>
        © {new Date().getFullYear()} Petals by Dar — made with care in
        Woodburn, OR.
      </p>
    </footer>
  );
}
