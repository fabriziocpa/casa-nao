"use client";

import { useState, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { parseISO, startOfToday } from "date-fns";
import "react-day-picker/style.css";
import { toast } from "sonner";
import { toIso } from "@/lib/dates";
import { addManualBlock, removeManualBlock } from "@/features/blocked-dates/actions";

export function AdminCalendarClient({ reasons }: { reasons: Record<string, string> }) {
  const [local, setLocal] = useState(reasons);
  const [pending, startTransition] = useTransition();

  const reservedDates = Object.entries(local)
    .filter(([, r]) => r === "reservation")
    .map(([d]) => parseISO(d));
  const manualDates = Object.entries(local)
    .filter(([, r]) => r !== "reservation")
    .map(([d]) => parseISO(d));

  function handleSelect(day?: Date) {
    if (!day) return;
    const iso = toIso(day);
    const existing = local[iso];
    if (existing === "reservation") {
      toast.error("Esta fecha está bloqueada por una reserva. Gestiónala desde Reservas.");
      return;
    }
    if (existing) {
      startTransition(async () => {
        await removeManualBlock(iso);
        const { [iso]: removedDate, ...rest } = local;
        void removedDate;
        setLocal(rest);
        toast.success(`Bloqueo removido (${iso})`);
      });
    } else {
      startTransition(async () => {
        await addManualBlock(iso);
        setLocal({ ...local, [iso]: "manual" });
        toast.success(`Fecha bloqueada (${iso})`);
      });
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4">
      <DayPicker
        mode="single"
        onSelect={handleSelect}
        disabled={{ before: startOfToday() }}
        locale={es}
        numberOfMonths={2}
        pagedNavigation
        weekStartsOn={1}
        modifiers={{ reserved: reservedDates, manual: manualDates }}
        modifiersClassNames={{
          reserved: "bg-teal text-white rounded-md pointer-events-none",
          manual: "bg-rose/60 text-ink rounded-md",
        }}
      />
      {pending ? (
        <p className="text-[11px] text-ink/60 tracking-label mt-2">Guardando…</p>
      ) : null}
    </div>
  );
}
