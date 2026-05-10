ALTER TABLE "orders" ADD COLUMN "gallery_style" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_amount_cents" integer DEFAULT 10000 NOT NULL;