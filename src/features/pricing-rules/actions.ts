"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import { pricingRules, basePricing } from "@/db/schema";
import { requireAdmin } from "@/lib/supabase/server";

async function ensureAdmin() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const boolish = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
  .transform((v) => v === true || v === "on" || v === "true")
  .optional()
  .default(false);

const ruleSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2),
    startDate: isoDate,
    endDate: isoDate,
    mode: z.enum(["manual", "discount"]).default("manual"),
    nightlyDollars: z.coerce.number().optional(),
    discountPct: z.coerce.number().optional(),
    roundToInteger: boolish,
    minNights: z
      .union([z.coerce.number().int().min(1), z.literal(""), z.null()])
      .transform((v) => (v === "" || v === null ? null : (v as number))),
    priority: z.coerce.number().int().default(0),
    active: boolish,
  })
  .refine((d) => d.startDate <= d.endDate, {
    path: ["endDate"],
    message: "La fecha fin debe ser igual o posterior a la fecha inicio",
  });

export async function upsertPricingRule(formData: FormData) {
  await ensureAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = ruleSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const data = parsed.data;

  let nightlyCents: number;
  if (data.mode === "discount") {
    if (data.discountPct == null || isNaN(data.discountPct)) {
      throw new Error("Ingresa el porcentaje de descuento.");
    }
    if (data.discountPct <= 0 || data.discountPct >= 100) {
      throw new Error("El descuento debe estar entre 1 y 99%.");
    }
    const baseRows = await db.select().from(basePricing).limit(1);
    const baseCents = baseRows[0]?.nightlyCents;
    if (!baseCents) {
      throw new Error("Configura primero la tarifa base.");
    }
    const discountedCents = baseCents * (1 - data.discountPct / 100);
    nightlyCents = data.roundToInteger
      ? Math.round(discountedCents / 100) * 100
      : Math.round(discountedCents);
  } else {
    if (data.nightlyDollars == null || isNaN(data.nightlyDollars) || data.nightlyDollars < 1) {
      throw new Error("Ingresa un precio válido (USD / noche).");
    }
    nightlyCents = data.roundToInteger
      ? Math.round(data.nightlyDollars) * 100
      : Math.round(data.nightlyDollars * 100);
  }

  const payload = {
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    nightlyCents,
    minNights: data.minNights,
    priority: data.priority,
    active: data.active,
  };

  if (data.id) {
    await db.update(pricingRules).set(payload).where(eq(pricingRules.id, data.id));
  } else {
    await db.insert(pricingRules).values(payload);
  }
  revalidateTag("pricing_rules");
  revalidatePath("/");
  revalidatePath("/admin/precios");
}

export async function deletePricingRule(id: string) {
  await ensureAdmin();
  await db.delete(pricingRules).where(eq(pricingRules.id, id));
  revalidateTag("pricing_rules");
  revalidatePath("/");
  revalidatePath("/admin/precios");
}
