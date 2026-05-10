import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GALLERY_PHOTOS,
  slugToPhoto,
  filenameToSlug,
  formatPrice,
  getBouquetFlowForFile,
} from "@/lib/gallery";

export function generateStaticParams() {
  return GALLERY_PHOTOS.map((p) => ({ slug: filenameToSlug(p.file) }));
}

export default async function GalleryPhotoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const photo = slugToPhoto(slug);
  if (!photo) notFound();

  const bouquetFlow = getBouquetFlowForFile(photo.file);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <Link
        href="/#gallery"
        className="mb-6 inline-flex items-center text-sm text-blush-700 hover:text-blush-900"
      >
        ← Back to gallery
      </Link>
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-blush-200 shadow-card md:aspect-[4/5]">
          <Image
            src={`/gallery/${photo.file}`}
            alt="Bouquet by Petals by Dar"
            fill
            priority
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="pill mb-5">One-of-a-kind</span>
          <h1 className="serif text-4xl leading-tight md:text-5xl">
            <span className="italic-accent">Bouquet</span> in this style.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            Hand-made to order. Final pricing depends on size, flowers in season,
            and any personal touches you'd like added.
          </p>

          <div className="mt-8 rounded-2xl border border-blush-200 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.14em] text-blush-700">
              Starting at
            </p>
            <p className="serif mt-1 text-4xl">{formatPrice(photo.priceCents)}</p>
            {photo.note && (
              <p className="mt-2 text-xs italic text-blush-800">{photo.note}</p>
            )}
            <p className="mt-1 text-xs text-blush-700">
              Deposit secures your bouquet · Remainder paid at pickup
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/order/details?bouquet=${bouquetFlow}&style=${slug}`}
              className="btn-primary"
            >
              Order this style →
            </Link>
            <Link href="/#gallery" className="btn-secondary">
              See more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
