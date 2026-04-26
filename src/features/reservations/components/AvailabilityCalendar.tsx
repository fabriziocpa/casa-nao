"use client";

import { DayPicker, type DateRange, type MonthCaptionProps } from "react-day-picker";
import { es } from "date-fns/locale";
import { parseISO, startOfToday } from "date-fns";
import { useMemo } from "react";
import "react-day-picker/style.css";

type MonthlyDiscount = { ym: string; pct: number; ruleName: string };

type Props = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  blockedIso: string[];
  monthlyDiscounts?: MonthlyDiscount[];
};

export function AvailabilityCalendar({
  value,
  onChange,
  blockedIso,
  monthlyDiscounts = [],
}: Props) {
  const disabled = useMemo(() => {
    const dates = blockedIso.map((d) => parseISO(d));
    return [{ before: startOfToday() }, ...dates];
  }, [blockedIso]);

  const discountByYm = useMemo(() => {
    const m = new Map<string, MonthlyDiscount>();
    for (const d of monthlyDiscounts) m.set(d.ym, d);
    return m;
  }, [monthlyDiscounts]);

  const MonthCaption = useMemo(
    () =>
      function MonthCaptionWithBadge(props: MonthCaptionProps) {
        const { calendarMonth, displayIndex: _displayIndex, children, ...divProps } = props;
        void _displayIndex;
        const date = calendarMonth.date;
        const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const discount = discountByYm.get(ym);
        return (
          <div {...divProps} className={(divProps.className ?? "") + " flex items-center justify-between gap-2"}>
            <div className="flex-1 min-w-0">{children}</div>
            {discount ? (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 text-emerald-700 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
                title={`${discount.ruleName} · ${discount.pct}% de descuento todo el mes`}
                aria-label={`Descuento de ${discount.pct}% en ${discount.ruleName}`}
              >
                <span aria-hidden>%</span>
                <span>–{discount.pct}%</span>
              </span>
            ) : null}
          </div>
        );
      },
    [discountByYm],
  );

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4">
      <DayPicker
        mode="range"
        selected={value}
        onSelect={onChange}
        disabled={disabled}
        excludeDisabled
        locale={es}
        numberOfMonths={2}
        pagedNavigation
        weekStartsOn={1}
        components={{ MonthCaption }}
        classNames={{
          selected: "bg-teal text-white",
          range_start: "bg-teal text-white rounded-l-full",
          range_end: "bg-teal text-white rounded-r-full",
          range_middle: "bg-teal/30 text-ink",
          disabled: "bg-rose/30 text-ink/40 line-through",
          today: "underline",
        }}
      />
      <div className="mt-3 flex gap-4 text-[11px] tracking-label text-ink/60 flex-wrap">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-teal" /> Seleccionado
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-rose/60" /> No disponible
        </span>
        {monthlyDiscounts.length > 0 ? (
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-emerald-600/10 text-emerald-700 px-1.5 py-0.5 text-[10px]">
              –%
            </span>{" "}
            Mes con descuento
          </span>
        ) : null}
      </div>
    </div>
  );
}
