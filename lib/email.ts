import { Resend } from "resend";
import type { Order } from "./schema";
import { getBouquet, formatUSD } from "./bouquets";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = "Petals by Dar <orders@petalsbydar.com>";

export async function sendOwnerNotification(order: Order) {
  if (!resend) return;
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!ownerEmail) return;
  const bouquet = getBouquet(order.bouquetType);
  const lines = [
    `New deposit received: ${bouquet?.name ?? order.bouquetType}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    order.instagram ? `Instagram: ${order.instagram}` : "",
    `Pickup: ${order.pickupDate} at ${order.pickupTime}`,
    "",
    `Notes: ${order.notes ?? "(none)"}`,
    order.inspirationLinks.length ? `Links: ${order.inspirationLinks.join(", ")}` : "",
    order.inspirationUrls.length ? `Uploads: ${order.inspirationUrls.join(", ")}` : "",
    "",
    `Deposit: ${formatUSD(order.depositAmountCents)}`,
  ]
    .filter(Boolean)
    .join("\n");
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `🌸 New deposit: ${bouquet?.name ?? "Bouquet"} — ${order.customerName}`,
    text: lines,
  });
}

export async function sendCustomerReceipt(order: Order) {
  if (!resend) return;
  const bouquet = getBouquet(order.bouquetType);
  const text = [
    `Hi ${order.customerName.split(" ")[0]},`,
    "",
    `Thanks for your order with Petals by Dar! Your deposit of ${formatUSD(order.depositAmountCents)} for the ${bouquet?.name ?? "bouquet"} has been received.`,
    "",
    `Pickup: ${order.pickupDate} at ${order.pickupTime}`,
    `Remainder due at pickup: ${formatUSD((bouquet?.priceCents ?? 10000) - order.depositAmountCents)}`,
    "",
    "We'll text you to confirm details. If anything changes, just reply to this email.",
    "",
    "— Petals by Dar 🌸",
  ].join("\n");
  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: "🌸 Your bouquet is locked in — Petals by Dar",
    text,
  });
}
