import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    totalAmountCents: order.totalAmountCents,
    depositAmountCents: order.depositAmountCents,
    galleryStyle: order.galleryStyle,
    status: order.status,
  });
}
