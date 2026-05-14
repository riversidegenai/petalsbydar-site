ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "square_payment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "amount_paid_cents" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp with time zone;