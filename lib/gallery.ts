export type GalleryPhoto = {
  file: string;
  priceCents: number;
  note?: string;
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { file: "IMG_3159.jpg", priceCents: 8000 },
  { file: "IMG_3156.jpg", priceCents: 8500 },
  { file: "IMG_3147.jpg", priceCents: 10500 },
  { file: "IMG_3106.jpg", priceCents: 8000 },
  { file: "IMG_3131.jpg", priceCents: 8500 },
  { file: "IMG_3137.jpg", priceCents: 4500 },
  { file: "IMG_3138.jpg", priceCents: 4500 },
  { file: "IMG_3143.jpg", priceCents: 10500 },
  { file: "IMG_3146.jpg", priceCents: 8000 },
  { file: "IMG_3161.jpg", priceCents: 12500 },
  { file: "IMG_3166.jpg", priceCents: 8500 },
  { file: "IMG_3167.jpg", priceCents: 7000 },
  { file: "IMG_3101.jpg", priceCents: 15500 },
  { file: "IMG_3102.jpg", priceCents: 5000 },
  { file: "IMG_3103.jpg", priceCents: 9000 },
  { file: "IMG_3104.jpg", priceCents: 4000 },
  { file: "IMG_3107.jpg", priceCents: 7000 },
  { file: "IMG_3108.jpg", priceCents: 18000 },
  { file: "IMG_3109.jpg", priceCents: 7000 },
  { file: "IMG_3110.jpg", priceCents: 8000 },
  { file: "IMG_3111.jpg", priceCents: 5500 },
  { file: "IMG_3112.jpg", priceCents: 23500 },
  { file: "IMG_3113.jpg", priceCents: 8500 },
  { file: "IMG_3114.jpg", priceCents: 4500 },
  { file: "IMG_3115.jpg", priceCents: 4000 },
  { file: "IMG_3116.jpg", priceCents: 2000 },
  { file: "IMG_3117.jpg", priceCents: 2000 },
  { file: "IMG_3119.jpg", priceCents: 4500 },
  { file: "IMG_3120.jpg", priceCents: 3000 },
  { file: "IMG_3121.jpg", priceCents: 3000 },
  { file: "IMG_3122.jpg", priceCents: 9000 },
  { file: "IMG_3124.jpg", priceCents: 2000 },
  { file: "IMG_3125.jpg", priceCents: 2000 },
  { file: "IMG_3126.jpg", priceCents: 1000 },
  { file: "IMG_3129.jpg", priceCents: 4500 },
  { file: "IMG_3130.jpg", priceCents: 8000 },
  { file: "IMG_3132.jpg", priceCents: 2500 },
  { file: "IMG_3133.jpg", priceCents: 11500 },
  { file: "IMG_3134.jpg", priceCents: 7500 },
  { file: "IMG_3135.jpg", priceCents: 5500 },
  { file: "IMG_3136.jpg", priceCents: 4500 },
  { file: "IMG_3139.jpg", priceCents: 5500 },
  { file: "IMG_3140.jpg", priceCents: 9000 },
  { file: "IMG_3141.jpg", priceCents: 8500 },
  { file: "IMG_3142.jpg", priceCents: 11500 },
  { file: "IMG_3144.jpg", priceCents: 15500 },
  { file: "IMG_3145.jpg", priceCents: 10500 },
  { file: "IMG_3148.jpg", priceCents: 7500 },
  { file: "IMG_3149.jpg", priceCents: 7500 },
  { file: "IMG_3150.jpg", priceCents: 7500 },
  { file: "IMG_3152.jpg", priceCents: 7500 },
  { file: "IMG_3153.jpg", priceCents: 8000 },
  { file: "IMG_3154.jpg", priceCents: 7500 },
  { file: "IMG_3155.jpg", priceCents: 15500, note: "Not including makeup" },
  { file: "IMG_3157.jpg", priceCents: 14500 },
  { file: "IMG_3158.jpg", priceCents: 4500 },
  { file: "IMG_3160.jpg", priceCents: 11500 },
  { file: "IMG_3162.jpg", priceCents: 9000 },
  { file: "IMG_3163.jpg", priceCents: 8500 },
  { file: "IMG_3164.jpg", priceCents: 5000 },
  { file: "IMG_3165.jpg", priceCents: 8500 },
];

// Occasion-bouquet picker. These are filenames that already exist in
// GALLERY_PHOTOS — listing them here pulls them into the Occasion flow's
// "Like one of these?" picker. Update with the 12 occasion photos when ready.
export const OCCASION_FILES: string[] = [
  "IMG_3152.jpg",
  "IMG_3153.jpg",
  "IMG_3155.jpg",
  "IMG_3102.jpg",
  "IMG_3103.jpg",
  "IMG_3104.jpg",
  "IMG_3130.jpg",
  "IMG_3139.jpg",
  "IMG_3140.jpg",
  "IMG_3142.jpg",
  "IMG_3145.jpg",
  "IMG_3161.jpg",
];

export function getOccasionPhotos(): GalleryPhoto[] {
  return OCCASION_FILES.map((file) => GALLERY_PHOTOS.find((p) => p.file === file)).filter(
    (p): p is GalleryPhoto => p !== undefined,
  );
}

export function slugToPhoto(slug: string): GalleryPhoto | null {
  const filename = `${slug}.jpg`;
  return GALLERY_PHOTOS.find((p) => p.file === filename) ?? null;
}

export function filenameToSlug(filename: string): string {
  return filename.replace(/\.jpg$/i, "");
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
