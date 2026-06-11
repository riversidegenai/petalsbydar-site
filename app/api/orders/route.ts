import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getBouquet } from "@/lib/bouquets";
import { slugToPhoto, depositForCents } from "@/lib/gallery";
import { sendOwnerNotification } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json();
  const bouquet = getBouquet(body.bouquetType);
  if (!bouquet) {
    return NextResponse.json({ error: "Invalid bouquet type" }, { status: 400 });
  }
  if (!body.customerName || !body.phone || !body.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const galleryStyle: string | null = body.galleryStyle ?? null;
  const stylePhoto = galleryStyle ? slugToPhoto(galleryStyle) : null;
  const totalCents = stylePhoto?.priceCents ?? bouquet.priceCents;
  const depositCents = stylePhoto
    ? depositForCents(totalCents)
    : bouquet.depositCents;
  const paymentType: "deposit" | "full" =
    body.paymentType === "full" && stylePhoto ? "full" : "deposit";

  let row;
  try {
    [row] = await db
      .insert(orders)
      .values({
        bouquetType: bouquet.id,
        customerName: body.customerName,
        phone: body.phone,
        email: body.email,
        instagram: body.instagram ?? null,
        notes: body.notes ?? null,
        inspirationUrls: body.inspirationUrls ?? [],
        inspirationLinks: body.inspirationLinks ?? [],
        galleryStyle,
        totalAmountCents: totalCents,
        depositAmountCents: depositCents,
        paymentType,
        status: "pending_payment",
      })
      .returning();
  } catch (err) {
    // Most likely the database is unreachable (e.g. a paused Supabase project)
    // or misconfigured. Without this, the route emits a bodyless 500 and the
    // customer is silently stranded with no path to checkout. Log loudly and
    // return a JSON message the form can show.
    console.error("[orders] failed to save order — database error:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't save your order right now. This is on our end — please try again in a moment, or message petalsbydar@gmail.com and we'll take your order directly.",
      },
      { status: 503 },
    );
  }

  // Notify the owner so she can match this submission with the Square
  // appointment that comes in next. No-op without RESEND_API_KEY.
  void sendOwnerNotification(row).catch((err) => {
    console.error("sendOwnerNotification failed for order", row.id, err);
  });

  return NextResponse.json({ id: row.id });
}
