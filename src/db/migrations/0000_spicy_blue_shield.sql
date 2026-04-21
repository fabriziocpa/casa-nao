CREATE TYPE "public"."doc_type" AS ENUM('DNI', 'CE', 'PASSPORT');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "base_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nightly_cents" integer NOT NULL,
	"min_nights" integer DEFAULT 2 NOT NULL,
	"max_guests" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"reason" text NOT NULL,
	"reservation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blocked_dates_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"nightly_cents" integer NOT NULL,
	"min_nights" integer,
	"priority" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"nights" integer NOT NULL,
	"guests" integer NOT NULL,
	"doc_type" "doc_type" NOT NULL,
	"doc_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text,
	"consent" boolean DEFAULT false NOT NULL,
	"nightly_breakdown" text NOT NULL,
	"total_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"contact_email" text NOT NULL,
	"attention_hours" text DEFAULT '7am - 11pm' NOT NULL,
	"instagram" text DEFAULT 'casanao.peru' NOT NULL,
	"facebook" text DEFAULT 'naohouse' NOT NULL,
	"tiktok" text DEFAULT 'naohouse' NOT NULL,
	"bank_info" text NOT NULL,
	"checkin_time" text DEFAULT '14:00' NOT NULL,
	"checkout_time" text DEFAULT '11:00' NOT NULL,
	"min_age" integer DEFAULT 25 NOT NULL,
	"address_line" text DEFAULT 'Carretera Panamericana Km 1145, Condominio NORD, El Ñuro, Piura' NOT NULL,
	"latitude" text,
	"longitude" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;
