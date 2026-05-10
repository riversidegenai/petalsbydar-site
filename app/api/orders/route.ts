import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getBouquet } from "@/lib/bouquets";
import { slugToPhoto } from "@/lib/gallery";

export async function POST(req: Request) {
  const body = await req.json();
  const bouquet = getBouquet(body.bouquetType);
  if (!bouquet) {
    return NextResponse.json({ error: "Invalid bouquet type" }, { status: 400 });
  }
  if (!body.customerName || !body.phone || !body.email || !body.pickupDate || !body.pickupTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const galleryStyle: string | null = body.galleryStyle ?? null;
  const stylePhoto = galleryStyle ? slugToPhoto(galleryStyle) : null;
  const totalCents = stylePhoto?.priceCents ?? bouquet.priceCents;
  const depositCents = stylePhoto
    ? Math.max(2000, Math.round((totalCents * 0.4) / 500) * 500)
    : bouquet.depositCents;

  const [row] = await db
    .insert(orders)
    .values({
      bouquetType: bouquet.id,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      instagram: body.instagram ?? null,
      pickupDate: body.pickupDate,
      pickupTime: body.pickupTime,
      notes: body.notes ?? null,
      inspirationUrls: body.inspirationUrls ?? [],
      inspirationLinks: body.inspirationLinks ?? [],
      galleryStyle,
      totalAmountCents: totalCents,
      depositAmountCents: depositCents,
      status: "draft",
    })
    .returning({ id: orders.id });

  return NextResponse.json({ id: row.id });
}
