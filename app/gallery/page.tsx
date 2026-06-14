import type { Metadata } from "next";
import Link from "next/link";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery — Petals by Dar",
  description:
    "Browse the full collection of hand-made, made-to-order bouquets by Petals by Dar.",
};

export default function GalleryPage() {
  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blush-700 hover:text-blush-900"
        >
          ← Back home
        </Link>
      </div>
      <Gallery
        showAll
        heading={
          <>
            The full <span className="italic-accent">collection</span>.
          </>
        }
      />
    </div>
  );
}
