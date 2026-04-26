"use server";

import { z } from "zod";
import { and, eq, lte, gte, ne } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import { basePricing, pricingRules } from "@/db/schema";
import { getBasePricing } from "@/features/reservations/queries";
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

export type PricingRuleConflict = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priority: number;
  willWin: boolean;
};

export type PricingRuleFormState =
  | { ok: true; warnings: PricingRuleConflict[] }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

export async function upsertPricingRule(
  _prev: PricingRuleFormState,
  formData: FormData,
): Promise<PricingRuleFormState> {
  await ensureAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = ruleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      fieldErrors,
    };
  }
  const data = parsed.data;

  let nightlyCents: number;
  let storedDiscountPct: number | null = null;
  if (data.mode === "discount") {
    if (data.discountPct == null || isNaN(data.discountPct)) {
      return {
        ok: false,
        error: "Ingresa el porcentaje de descuento.",
        fieldErrors: { discountPct: "Requerido" },
      };
    }
    if (data.discountPct <= 0 || data.discountPct >= 100) {
      return {
        ok: false,
        error: "El descuento debe estar entre 1 y 99%.",
        fieldErrors: { discountPct: "Entre 1 y 99" },
      };
    }
    const { nightlyCents: baseCents } = await getBasePricing();
    if (!baseCents) {
      return { ok: false, error: "Configura primero la tarifa base." };
    }
    storedDiscountPct = Math.round(data.discountPct);
    const discountedCents = baseCents * (1 - storedDiscountPct / 100);
    nightlyCents = Math.round(discountedCents);
  } else {
    if (data.nightlyDollars == null || isNaN(data.nightlyDollars) || data.nightlyDollars < 1) {
      return {
        ok: false,
        error: "Ingresa un precio válido (USD / noche).",
        fieldErrors: { nightlyDollars: "Mínimo 1" },
      };
    }
    nightlyCents = Math.round(data.nightlyDollars * 100);
  }

  const payload = {
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    nightlyCents,
    kind: data.mode,
    discountPct: storedDiscountPct,
    minNights: data.minNights,
    priority: data.priority,
    active: data.active,
  };

  let savedId: string;
  if (data.id) {
    await db.update(pricingRules).set(payload).where(eq(pricingRules.id, data.id));
    savedId = data.id;
  } else {
    const [row] = await db.insert(pricingRules).values(payload).returning({ id: pricingRules.id });
    savedId = row.id;
  }

  const warnings = data.active
    ? await findOverlappingRules({
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        excludeId: savedId,
      })
    : [];

  revalidateTag("pricing_rules");
  revalidatePath("/");
  revalidatePath("/admin/precios");
  return { ok: true, warnings };
}

export async function deletePricingRule(id: string) {
  await ensureAdmin();
  await db.delete(pricingRules).where(eq(pricingRules.id, id));
  revalidateTag("pricing_rules");
  revalidatePath("/");
  revalidatePath("/admin/precios");
}

async function findOverlappingRules(opts: {
  startDate: string;
  endDate: string;
  priority: number;
  excludeId: string;
}): Promise<PricingRuleConflict[]> {
  const rows = await db
    .select()
    .from(pricingRules)
    .where(
      and(
        eq(pricingRules.active, true),
        ne(pricingRules.id, opts.excludeId),
        lte(pricingRules.startDate, opts.endDate),
        gte(pricingRules.endDate, opts.startDate),
      ),
    );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    startDate: r.startDate,
    endDate: r.endDate,
    priority: r.priority,
    willWin: r.priority > opts.priority,
  }));
}

const baseSchema = z.object({
  nightlyDollars: z.coerce.number().min(1, "Mínimo 1"),
  minNights: z.coerce.number().int().min(1, "Mínimo 1"),
  maxGuests: z.coerce.number().int().min(1, "Mínimo 1"),
});

export type BasePricingFormState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

export async function upsertBasePricing(
  _prev: BasePricingFormState,
  formData: FormData,
): Promise<BasePricingFormState> {
  await ensureAdmin();
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisa los campos.", fieldErrors };
  }
  const nightlyCents = Math.round(parsed.data.nightlyDollars * 100);

  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: basePricing.id }).from(basePricing).limit(1);
    if (existing[0]) {
      await tx
        .update(basePricing)
        .set({
          nightlyCents,
          minNights: parsed.data.minNights,
          maxGuests: parsed.data.maxGuests,
          updatedAt: new Date(),
        })
        .where(eq(basePricing.id, existing[0].id));
    } else {
      await tx.insert(basePricing).values({
        nightlyCents,
        minNights: parsed.data.minNights,
        maxGuests: parsed.data.maxGuests,
      });
    }

    const discountRules = await tx
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.kind, "discount"));
    for (const r of discountRules) {
      if (r.discountPct == null) continue;
      const newCents = Math.round(nightlyCents * (1 - r.discountPct / 100));
      if (newCents !== r.nightlyCents) {
        await tx
          .update(pricingRules)
          .set({ nightlyCents: newCents })
          .where(eq(pricingRules.id, r.id));
      }
    }
  });

  revalidateTag("base_pricing");
  revalidateTag("pricing_rules");
  revalidatePath("/");
  revalidatePath("/admin/precios");
  return { ok: true };
}
