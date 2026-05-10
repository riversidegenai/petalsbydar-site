"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCustomPickerPhotos,
  getJustBecausePhotos,
  getOccasionPhotos,
  filenameToSlug,
  formatPrice,
} from "@/lib/gallery";

type Variant = "custom" | "just_because" | "occasion";

export default function StylePicker({ variant = "custom" }: { variant?: Variant }) {
  const router = useRouter();
  const params = useSearchParams();
  const currentStyle = params.get("style");

  const photos =
    variant === "occasion"
      ? getOccasionPhotos()
      : variant === "just_because"
        ? getJustBecausePhotos()
        : getCustomPickerPhotos();

  const heading =
    variant === "occasion"
      ? "Like one of these occasion bouquets? (optional)"
      : variant === "just_because"
        ? "Like one of these just-because bouquets? (optional)"
        : "Like one of these? (optional)";
  const subhead =
    variant === "occasion"
      ? "Tap one to start from that style — Dar can still customize colors and details to fit the occasion."
      : variant === "just_because"
        ? "Tap one to start from that style — Dar can still customize colors and details to fit the moment."
        : "Tap a bouquet to start from that style — Dar can still customize colors and details to fit you.";

  function pick(file: string) {
    const slug = filenameToSlug(file);
    const next = new URLSearchParams(params.toString());
    next.set("style", slug);
    router.replace(`/order/details?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="label">{heading}</p>
        <p className="mt-1 text-xs text-blush-700">{subhead}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
        {photos.map((photo) => {
          const slug = filenameToSlug(photo.file);
          const active = currentStyle === slug;
          return (
            <button
              key={photo.file}
              type="button"
              onClick={() => pick(photo.file)}
              aria-pressed={active}
              className={`group relative aspect-square overflow-hidden rounded-2xl border ${
                active
                  ? "border-blush-600 ring-2 ring-blush-400"
                  : "border-blush-200 hover:border-blush-400"
              } shadow-card transition`}
            >
              <Image
                src={`/gallery/${photo.file}`}
                alt=""
                fill
                sizes="(min-width: 768px) 22vw, 30vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-x-1 bottom-1 rounded-full bg-white/90 px-2 py-0.5 text-center text-[10px] font-medium text-blush-800 opacity-0 transition group-hover:opacity-100">
                {formatPrice(photo.priceCents)}
              </span>
              {active && (
                <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-blush-700 px-2 py-0.5 text-[10px] font-medium text-white">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
