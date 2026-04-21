import { eachDayOfInterval, parseISO } from "date-fns";
import { toIso } from "@/lib/dates";

export type PricingRuleInput = {
  startDate: string;
  endDate: string;
  nightlyCents: number;
  minNights: number | null;
  priority: number;
};

export type BasePricingInput = {
  nightlyCents: number;
  minNights: number;
  maxGuests: number;
};

export type StayCalc = {
  nights: number;
  breakdown: { date: string; cents: number }[];
  totalCents: number;
  minNightsRequired: number;
  appliedRuleNames: string[];
};

/**
 * Pure stay calculator. `checkIn` and `checkOut` are date-only.
 * Nights are the days in `[checkIn, checkOut)`.
 */
export function calculateStay(
  checkIn: Date | string,
  checkOut: Date | string,
  rules: (PricingRuleInput & { name?: string })[],
  base: BasePricingInput,
): StayCalc {
  const start = typeof checkIn === "string" ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === "string" ? parseISO(checkOut) : checkOut;

  const interval = eachDayOfInterval({ start, end });
  const nightDates = interval.slice(0, -1); // nights = days[start..end-1]

  let minNightsRequired = base.minNights;
  const applied = new Set<string>();

  const breakdown = nightDates.map((d) => {
    const iso = toIso(d);
    const hit = [...rules]
      .filter((r) => iso >= r.startDate && iso <= r.endDate)
      .sort((a, b) => b.priority - a.priority)[0];
    const cents = hit ? hit.nightlyCents : base.nightlyCents;
    if (hit?.minNights) minNightsRequired = Math.max(minNightsRequired, hit.minNights);
    if (hit?.name) applied.add(hit.name);
    return { date: iso, cents };
  });

  const totalCents = breakdown.reduce((a, b) => a + b.cents, 0);
  return {
    nights: breakdown.length,
    breakdown,
    totalCents,
    minNightsRequired,
    appliedRuleNames: [...applied],
  };
}
