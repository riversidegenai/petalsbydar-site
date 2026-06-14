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
  // This endpoint is reachable by anyone holding the order UUID (no session/
  // ownership check), so we return the minimum the payment page needs. We expose
  // only the first name for a friendly "Bouquet for …" confirmation rather than
  // the full name, to limit PII leakage if a payment URL is shared or logged.
  const firstName = order.customerName.trim().split(/\s+/)[0] ?? "";
  return NextResponse.json({
    customerFirstName: firstName,
    totalAmountCents: order.totalAmountCents,
    depositAmountCents: order.depositAmountCents,
    paymentType: order.paymentType,
    galleryStyle: order.galleryStyle,
    status: order.status,
  });
}
