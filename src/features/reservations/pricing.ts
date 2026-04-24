import { eachDayOfInterval, parseISO } from "date-fns";
import { toIso } from "@/lib/dates";

export type PricingRuleKind = "manual" | "discount";

export type PricingRuleInput = {
  startDate: string;
  endDate: string;
  nightlyCents: number;
  minNights: number | null;
  priority: number;
  kind: PricingRuleKind;
  discountPct: number | null;
};

export type BasePricingInput = {
  nightlyCents: number;
  minNights: number;
  maxGuests: number;
};

export type StayNight = {
  date: string;
  cents: number;
  baseCents: number;
  ruleName?: string;
  ruleKind?: PricingRuleKind;
  discountPct?: number | null;
};

export type StayCalc = {
  nights: number;
  breakdown: StayNight[];
  totalCents: number;
  baseTotalCents: number;
  savingsCents: number;
  minNightsRequired: number;
  appliedRuleNames: string[];
  appliedDiscountPct: number | null;
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
  const nightDates = interval.slice(0, -1);

  let minNightsRequired = base.minNights;
  const applied = new Set<string>();
  let singleDiscountPct: number | null | undefined = undefined;

  const breakdown: StayNight[] = nightDates.map((d) => {
    const iso = toIso(d);
    const hit = [...rules]
      .filter((r) => iso >= r.startDate && iso <= r.endDate)
      .sort((a, b) => b.priority - a.priority)[0];
    const cents = hit ? hit.nightlyCents : base.nightlyCents;
    if (hit?.minNights) minNightsRequired = Math.max(minNightsRequired, hit.minNights);
    if (hit?.name) applied.add(hit.name);

    if (hit?.kind === "discount" && hit.discountPct) {
      if (singleDiscountPct === undefined) singleDiscountPct = hit.discountPct;
      else if (singleDiscountPct !== hit.discountPct) singleDiscountPct = null;
    } else if (hit) {
      singleDiscountPct = null;
    }

    return {
      date: iso,
      cents,
      baseCents: base.nightlyCents,
      ruleName: hit?.name,
      ruleKind: hit?.kind,
      discountPct: hit?.discountPct ?? null,
    };
  });

  const totalCents = breakdown.reduce((a, b) => a + b.cents, 0);
  const baseTotalCents = breakdown.reduce((a, b) => a + b.baseCents, 0);
  return {
    nights: breakdown.length,
    breakdown,
    totalCents,
    baseTotalCents,
    savingsCents: Math.max(0, baseTotalCents - totalCents),
    minNightsRequired,
    appliedRuleNames: [...applied],
    appliedDiscountPct: typeof singleDiscountPct === "number" ? singleDiscountPct : null,
  };
}
