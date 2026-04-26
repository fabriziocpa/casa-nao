import "server-only";

import { addMonths, eachDayOfInterval, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { and, desc, eq, gte, lte, ne, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@/config/site";
import { db } from "@/db";
import { basePricing, blockedDates, pricingRules, reservations } from "@/db/schema";
import { toIso } from "@/lib/dates";
import type { BasePricingInput, PricingRuleInput } from "./pricing";

export const getBlockedDatesList = unstable_cache(
  async (monthsAhead = 18): Promise<string[]> => {
    const today = startOfDay(new Date());
    const until = addMonths(today, monthsAhead);
    const rows = await db
      .select({ date: blockedDates.date })
      .from(blockedDates)
      .leftJoin(reservations, eq(blockedDates.reservationId, reservations.id))
      .where(
        and(
          gte(blockedDates.date, toIso(today)),
          lte(blockedDates.date, toIso(until)),
          or(
            ne(blockedDates.reason, "reservation"),
            eq(reservations.status, "confirmed"),
          ),
        ),
      );
    return rows.map((r) => r.date);
  },
  ["reservations.blocked_dates"],
  { revalidate: 60, tags: ["blocked_dates"] },
);

export const getActivePricingRules = unstable_cache(
  async (): Promise<(PricingRuleInput & { name: string })[]> => {
    const rows = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.active, true));
    return rows.map((r) => ({
      name: r.name,
      startDate: r.startDate,
      endDate: r.endDate,
      nightlyCents: r.nightlyCents,
      minNights: r.minNights,
      priority: r.priority,
      kind: r.kind,
      discountPct: r.discountPct,
    }));
  },
  ["reservations.pricing_rules.active"],
  { revalidate: 60, tags: ["pricing_rules"] },
);

export const getBasePricing = unstable_cache(
  async (): Promise<BasePricingInput> => {
    const [row] = await db
      .select()
      .from(basePricing)
      .orderBy(desc(basePricing.updatedAt))
      .limit(1);
    if (!row) {
      return {
        nightlyCents: siteConfig.baseNightlyCents,
        minNights: siteConfig.lowSeasonMinNights,
        maxGuests: siteConfig.maxGuests,
      };
    }
    return {
      nightlyCents: row.nightlyCents,
      minNights: row.minNights,
      maxGuests: row.maxGuests,
    };
  },
  ["reservations.base_pricing"],
  { revalidate: 60, tags: ["base_pricing"] },
);

export const getMonthlyDiscounts = unstable_cache(
  async (
    monthsAhead = 12,
  ): Promise<{ ym: string; pct: number; ruleName: string }[]> => {
    const rules = await getActivePricingRules();
    const today = startOfDay(new Date());
    const result: { ym: string; pct: number; ruleName: string }[] = [];
    for (let i = 0; i < monthsAhead; i++) {
      const monthDate = addMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const covering = rules.find(
        (r) =>
          r.kind === "discount" &&
          r.discountPct &&
          days.every(
            (d) => toIso(d) >= r.startDate && toIso(d) <= r.endDate,
          ),
      );
      if (covering && covering.discountPct) {
        result.push({
          ym: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
          pct: covering.discountPct,
          ruleName: covering.name,
        });
      }
    }
    return result;
  },
  ["reservations.monthly_discounts"],
  { revalidate: 60, tags: ["pricing_rules", "base_pricing"] },
);

export async function getPricingSnapshot() {
  const [rules, base, blocked, monthlyDiscounts] = await Promise.all([
    getActivePricingRules(),
    getBasePricing(),
    getBlockedDatesList(),
    getMonthlyDiscounts(),
  ]);
  return { rules, base, blocked, monthlyDiscounts };
}
