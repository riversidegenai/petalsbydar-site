import { pgTable, uuid, text, integer, timestamp, date } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  bouquetType: text("bouquet_type").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  pickupDate: date("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  notes: text("notes"),
  inspirationUrls: text("inspiration_urls").array().notNull().default([]),
  inspirationLinks: text("inspiration_links").array().notNull().default([]),
  galleryStyle: text("gallery_style"),
  totalAmountCents: integer("total_amount_cents").notNull().default(10000),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  depositAmountCents: integer("deposit_amount_cents").notNull().default(4000),
  status: text("status", { enum: ["draft", "paid", "cancelled"] }).notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
