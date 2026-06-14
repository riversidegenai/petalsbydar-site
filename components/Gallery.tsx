import Image from "next/image";
import Link from "next/link";
import { GALLERY_PHOTOS, filenameToSlug, formatPrice } from "@/lib/gallery";

// Homepage shows a trimmed "Recent work" preview (first `limit` photos) with a
// link to the full gallery page. The /gallery page renders all photos by
// passing `showAll`. Keeping one component means the card styling stays in sync.
export default function Gallery({
  limit = 21,
  showAll = false,
  heading,
}: {
  limit?: number;
  showAll?: boolean;
  heading?: React.ReactNode;
}) {
  const photos = showAll ? GALLERY_PHOTOS : GALLERY_PHOTOS.slice(0, limit);

  return (
    <section id="gallery" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
      <div className="mb-10">
        <span className="pill mb-5">Gallery</span>
        <h2 className="serif text-4xl leading-tight md:text-5xl">
          {heading ?? (
            <>
              <span className="italic-accent">Recent</span> work.
            </>
          )}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {photos.map((photo, i) => (
          <Link
            key={photo.file}
            href={`/gallery/${filenameToSlug(photo.file)}`}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-blush-200 shadow-card"
          >
            <Image
              src={`/gallery/${photo.file}`}
              alt={`Bouquet ${i + 1}`}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-105"
              priority={i < 3}
            />
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-ink/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
              <div className="flex w-full items-center justify-between gap-3 p-4">
                <div className="text-white">
                  <p className="text-[10px] uppercase tracking-[0.14em] opacity-90">
                    Starting at
                  </p>
                  <p className="serif text-lg leading-none">
                    {formatPrice(photo.priceCents)}
                  </p>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-blush-800 shadow-glow">
                  Buy this →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* On the homepage preview, invite them into the full gallery. */}
      {!showAll && GALLERY_PHOTOS.length > limit && (
        <div className="mt-12 flex justify-center">
          <Link href="/gallery" className="btn-secondary">
            View full gallery →
          </Link>
        </div>
      )}
    </section>
  );
}
