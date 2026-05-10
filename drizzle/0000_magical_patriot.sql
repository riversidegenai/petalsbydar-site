CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bouquet_type" text NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"instagram" text,
	"pickup_date" date NOT NULL,
	"pickup_time" text NOT NULL,
	"notes" text,
	"inspiration_urls" text[] DEFAULT '{}' NOT NULL,
	"inspiration_links" text[] DEFAULT '{}' NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"deposit_amount_cents" integer DEFAULT 4000 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
