import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const reservationStatus = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
]);

export const docType = pgEnum("doc_type", ["DNI", "CE", "PASSPORT"]);

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  nights: integer("nights").notNull(),
  guests: integer("guests").notNull(),
  docType: docType("doc_type").notNull(),
  docNumber: text("doc_number").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  consent: boolean("consent").notNull().default(false),
  nightlyBreakdown: text("nightly_breakdown").notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: reservationStatus("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blockedDates = pgTable("blocked_dates", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(),
  reason: text("reason").notNull(),
  reservationId: uuid("reservation_id").references(() => reservations.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  nightlyCents: integer("nightly_cents").notNull(),
  minNights: integer("min_nights"),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const basePricing = pgTable("base_pricing", {
  id: uuid("id").defaultRandom().primaryKey(),
  nightlyCents: integer("nightly_cents").notNull(),
  minNights: integer("min_nights").notNull().default(2),
  maxGuests: integer("max_guests").notNull().default(15),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminEmail: text("admin_email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  contactEmail: text("contact_email").notNull(),
  attentionHours: text("attention_hours").notNull().default("7am - 11pm"),
  instagram: text("instagram").notNull().default("casanao.peru"),
  facebook: text("facebook").notNull().default("naohouse"),
  tiktok: text("tiktok").notNull().default("naohouse"),
  bankInfo: text("bank_info").notNull(),
  checkinTime: text("checkin_time").notNull().default("14:00"),
  checkoutTime: text("checkout_time").notNull().default("11:00"),
  minAge: integer("min_age").notNull().default(25),
  addressLine: text("address_line")
    .notNull()
    .default("Carretera Panamericana Km 1145, Condominio NORD, El Ñuro, Piura"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
