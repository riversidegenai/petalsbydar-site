import twilio from "twilio";
import type { Order } from "./schema";
import { getBouquet } from "./bouquets";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM_NUMBER;
const to = process.env.OWNER_SMS_NUMBER;

const client = sid && token ? twilio(sid, token) : null;

export async function sendOwnerSms(order: Order) {
  if (!client || !from || !to) return;
  const bouquet = getBouquet(order.bouquetType);
  const body = `🌸 New deposit: ${bouquet?.name ?? "Bouquet"} — ${order.customerName} (${order.phone}). Pickup ${order.pickupDate} ${order.pickupTime}.`;
  await client.messages.create({ from, to, body });
}
