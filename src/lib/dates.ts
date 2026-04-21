import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  formatISO,
  isValid,
  parseISO,
} from "date-fns";

export function toIso(d: Date): string {
  return formatISO(d, { representation: "date" });
}

export function fromIso(s: string): Date {
  return parseISO(s);
}

export function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && isValid(parseISO(s));
}

function nightsBetween(checkIn: Date | string, checkOut: Date | string): number {
  const a = typeof checkIn === "string" ? parseISO(checkIn) : checkIn;
  const b = typeof checkOut === "string" ? parseISO(checkOut) : checkOut;
  return Math.max(0, differenceInCalendarDays(b, a));
}

/**
 * All blocked dates for a stay: every night from check-in up to (but not
 * including) check-out. i.e. [checkIn, checkOut) in date-only terms.
 */
export function stayNightDates(checkIn: Date, checkOut: Date): Date[] {
  const n = nightsBetween(checkIn, checkOut);
  if (n <= 0) return [];
  return eachDayOfInterval({ start: checkIn, end: addDays(checkIn, n - 1) });
}

export function formatEs(d: Date | string, pattern = "EEE d MMM yyyy"): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, pattern);
}
