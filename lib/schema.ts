import { pgTable, uuid, text, integer, timestamp, date } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  bouquetType: text("bouquet_type").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  // Pickup details now come from Square Appointments. Kept nullable so the
  // owner can backfill them from the matched Square appointment if she wants
  // (or for legacy rows from the Stripe era).
  pickupDate: date("pickup_date"),
  pickupTime: text("pickup_time"),
  notes: text("notes"),
  inspirationUrls: text("inspiration_urls").array().notNull().default([]),
  inspirationLinks: text("inspiration_links").array().notNull().default([]),
  galleryStyle: text("gallery_style"),
  totalAmountCents: integer("total_amount_cents").notNull().default(10000),
  depositAmountCents: integer("deposit_amount_cents").notNull().default(4000),
  // What the customer chose to pay on the website checkout step.
  // "deposit" = pay deposit now, remainder at pickup.
  // "full"    = pay the full amount now, nothing owed at pickup.
  paymentType: text("payment_type", { enum: ["deposit", "full"] })
    .notNull()
    .default("deposit"),
  // pending_payment = details saved, awaiting Square Web Payments charge
  // paid            = Square charged the card successfully
  // pending_booking = paid + customer should now book pickup time on Square Appointments
  // booked          = matched to a Square appointment (owner confirms manually)
  // cancelled       = abandoned or cancelled
  status: text("status", {
    enum: ["pending_payment", "paid", "pending_booking", "booked", "cancelled"],
  })
    .notNull()
    .default("pending_payment"),
  // Square Payment ID returned by paymentsApi.createPayment(). Used to
  // reconcile the order with the webhook event and as a receipt reference.
  squarePaymentId: text("square_payment_id"),
  // Cents actually captured by Square (may differ from totalAmountCents if
  // they chose deposit, or from depositAmountCents if they chose full).
  amountPaidCents: integer("amount_paid_cents"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
