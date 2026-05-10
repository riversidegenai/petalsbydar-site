import { Resend } from "resend";
import type { Order } from "./schema";
import { getBouquet, formatUSD } from "./bouquets";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = "Petals by Dar <orders@petalsbydar.com>";

// Heads-up to the owner that a customer just submitted details on the site
// and is being redirected to Square to book a slot + pay the deposit. The
// owner can match this submission with the Square appointment that lands
// next so she can attach the inspiration photos / notes to the booking.
export async function sendOwnerNotification(order: Order) {
  if (!resend) return;
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!ownerEmail) return;
  const bouquet = getBouquet(order.bouquetType);
  const lines = [
    `New order details from the website: ${bouquet?.name ?? order.bouquetType}`,
    `(Heads-up — they're being sent to Square now to pick a time + pay deposit.)`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    order.instagram ? `Instagram: ${order.instagram}` : "",
    order.galleryStyle ? `Inspired by: ${order.galleryStyle}` : "",
    "",
    `Notes: ${order.notes ?? "(none)"}`,
    order.inspirationLinks.length ? `Links: ${order.inspirationLinks.join(", ")}` : "",
    order.inspirationUrls.length ? `Uploads: ${order.inspirationUrls.join(", ")}` : "",
    "",
    order.paymentType === "full"
      ? `Wants to pay IN FULL today: ${formatUSD(order.totalAmountCents)} — nothing owed at pickup.`
      : `Wants to pay deposit today: ${formatUSD(order.depositAmountCents)}. Remainder ${formatUSD(order.totalAmountCents - order.depositAmountCents)} due at pickup.`,
    `Estimated total: ${formatUSD(order.totalAmountCents)}`,
  ]
    .filter(Boolean)
    .join("\n");
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `🌸 New website order: ${bouquet?.name ?? "Bouquet"} — ${order.customerName}`,
    text: lines,
  });
}
