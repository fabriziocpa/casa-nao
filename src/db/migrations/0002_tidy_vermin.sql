CREATE TYPE "public"."pricing_rule_kind" AS ENUM('manual', 'discount');--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD COLUMN "kind" "pricing_rule_kind" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD COLUMN "discount_pct" integer;