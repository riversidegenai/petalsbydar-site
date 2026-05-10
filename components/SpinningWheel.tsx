import Image from "next/image";

const ALL = [
  "IMG_3159.jpg", "IMG_3156.jpg", "IMG_3145.jpg", "IMG_3106.jpg",
  "IMG_3131.jpg", "IMG_3137.jpg", "IMG_3138.jpg", "IMG_3143.jpg",
  "IMG_3146.jpg", "IMG_3161.jpg", "IMG_3166.jpg", "IMG_3167.jpg",
  "IMG_3101.jpg", "IMG_3122.jpg", "IMG_3140.jpg",
];

export default function SpinningWheel() {
  const loop = [...ALL, ...ALL];
  return (
    <section className="overflow-hidden border-y border-blush-100 bg-white/40 py-8">
      <div className="marquee-track flex w-max">
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
