import "server-only";

import { addMonths, startOfDay } from "date-fns";
import { and, eq, gte, lte, ne, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@/config/site";
import { db } from "@/db";
import { blockedDates, pricingRules, reservations } from "@/db/schema";
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
    }));
  },
  ["reservations.pricing_rules.active"],
  { revalidate: 60, tags: ["pricing_rules"] },
);

export const getBasePricing = unstable_cache(
  async (): Promise<BasePricingInput> => {
    return {
      nightlyCents: siteConfig.baseNightlyCents,
      minNights: siteConfig.lowSeasonMinNights,
      maxGuests: siteConfig.maxGuests,
    };
  },
  ["reservations.base_pricing"],
  { revalidate: 60, tags: ["base_pricing"] },
);

export async function getPricingSnapshot() {
  const [rules, base, blocked] = await Promise.all([
    getActivePricingRules(),
    getBasePricing(),
    getBlockedDatesList(),
  ]);
  return { rules, base, blocked };
}
