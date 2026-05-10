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
  // What the customer said they want to pay at the Square booking step.
  // "deposit" = pay deposit now, remainder at pickup.
  // "full"    = pay the full amount now, nothing owed at pickup.
  paymentType: text("payment_type", { enum: ["deposit", "full"] })
    .notNull()
    .default("deposit"),
  // pending_booking = customer submitted details; waiting for them to book in Square
  // booked         = matched to a Square appointment (manual confirmation by owner)
  // cancelled      = abandoned or cancelled
  status: text("status", { enum: ["pending_booking", "booked", "cancelled"] })
    .notNull()
    .default("pending_booking"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
