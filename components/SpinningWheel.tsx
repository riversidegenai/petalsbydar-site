import Image from "next/image";

const ALL = [
  "IMG_3159.jpg", "IMG_3156.jpg", "IMG_3145.jpg", "IMG_3106.jpg",
  "IMG_3131.jpg", "IMG_3137.jpg", "IMG_3138.jpg", "IMG_3143.jpg",
  "IMG_3146.jpg", "IMG_3161.jpg", "IMG_3166.jpg", "IMG_3167.jpg",
  "IMG_3101.jpg", "IMG_3122.jpg", "IMG_3140.jpg",
];

export default function SpinningWheel() {
  // The CSS animation translates the track by exactly -50%, so the loop is
  // seamless only when the track is two identical halves. We build one "half"
  // that repeats the photo list enough times to overflow even very wide
  // screens (no gap at the seam), then render that half twice.
  const half = [...ALL, ...ALL];
  const loop = [...half, ...half];
  return (
    <section className="overflow-hidden border-y border-blush-100 bg-white/40 py-8">
      {/* aria-hidden: this is a decorative, infinitely scrolling strip. */}
      <div className="marquee-track flex w-max" aria-hidden="true">
        {loop.map((file, i) => (
          <div
            key={i}
            className="relative mr-3 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-blush-200 shadow-card md:h-32 md:w-32"
          >
            <Image
              src={`/gallery/${file}`}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
