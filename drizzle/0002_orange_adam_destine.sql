ALTER TABLE "orders" ALTER COLUMN "pickup_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "pickup_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_booking';--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "stripe_session_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "stripe_payment_intent_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "paid_at";