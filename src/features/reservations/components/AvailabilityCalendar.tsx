"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { parseISO, startOfToday } from "date-fns";
import { useMemo } from "react";
import "react-day-picker/style.css";

type Props = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  blockedIso: string[];
};

export function AvailabilityCalendar({ value, onChange, blockedIso }: Props) {
  const disabled = useMemo(() => {
    const dates = blockedIso.map((d) => parseISO(d));
    return [{ before: startOfToday() }, ...dates];
  }, [blockedIso]);

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
        classNames={{
          selected: "bg-teal text-white",
          range_start: "bg-teal text-white rounded-l-full",
          range_end: "bg-teal text-white rounded-r-full",
          range_middle: "bg-teal/30 text-ink",
          disabled: "bg-rose/30 text-ink/40 line-through",
          today: "underline",
        }}
      />
      <div className="mt-3 flex gap-4 text-[11px] tracking-label text-ink/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-teal" /> Seleccionado
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-rose/60" /> No disponible
        </span>
      </div>
    </div>
  );
}
