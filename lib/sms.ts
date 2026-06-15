import twilio from "twilio";
import type { Order } from "./schema";
import { getBouquet, formatUSD } from "./bouquets";

function twilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendOwnerSms(order: Order) {
  const client = twilioClient();
  if (!client) return;

  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_SMS_NUMBER;
  if (!from || !to) return;

  const bouquet = getBouquet(order.bouquetType);
  const bouquetName = bouquet?.name ?? order.bouquetType;

  const payLine =
    order.paymentType === "full"
      ? `Paid in full: ${formatUSD(order.totalAmountCents)}`
      : `Deposit paid: ${formatUSD(order.depositAmountCents)} (${formatUSD(order.totalAmountCents - order.depositAmountCents)} due at pickup)`;

  const body = [
    `🌸 New order: ${bouquetName}`,
    `${order.customerName} · ${order.phone}`,
    order.galleryStyle ? `Style: ${order.galleryStyle}` : "",
    order.notes ? `Notes: ${order.notes}` : "",
    payLine,
  ]
    .filter(Boolean)
    .join("\n");

  await client.messages.create({ from, to, body });
}
