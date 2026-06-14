export type BouquetId = "custom" | "occasion" | "just_because";

export type Bouquet = {
  id: BouquetId;
  name: string;
  priceCents: number;
  depositCents: number;
  description: string;
};

export const BOUQUETS: Bouquet[] = [
  {
    id: "custom",
    name: "Custom Bouquet",
    priceCents: 10000,
    // 50% deposit, rounded to nearest $5 (see depositForCents in gallery.ts).
    depositCents: 5000,
    description:
      "Hand-made bouquet built around your occasion, your colors, and the message you want to send. Includes consultation, ribbon + wrap of your choice, and a hand-written tag.",
  },
  {
    id: "occasion",
    name: "Occasion Bouquet",
    priceCents: 10000,
    // 50% deposit, rounded to nearest $5 (see depositForCents in gallery.ts).
    depositCents: 5000,
    description:
      "Themed for the moment — Mother's Day, Valentine's, birthdays, graduations, anniversaries. Comes with a printed sash and signature ribbon.",
  },
  {
    id: "just_because",
    name: "Just-Because Bouquet",
    priceCents: 10000,
    // 50% deposit, rounded to nearest $5 (see depositForCents in gallery.ts).
    depositCents: 5000,
    description:
      "No occasion needed. A surprise pick-me-up for someone who deserves one — partners, parents, friends, yourself.",
  },
];

export function getBouquet(id: string): Bouquet | undefined {
  return BOUQUETS.find((b) => b.id === id);
}

export function formatUSD(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
