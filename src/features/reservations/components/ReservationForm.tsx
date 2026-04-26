"use client";

import { useActionState, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toIso } from "@/lib/dates";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { StaySummary } from "./StaySummary";
import { PhoneInput } from "./PhoneInput";
import { submitReservation, type ReservationFormState } from "../actions";
import { calculateStay, type BasePricingInput, type PricingRuleInput } from "../pricing";
import { cn } from "@/lib/utils";

type Props = {
  blockedIso: string[];
  rules: (PricingRuleInput & { name: string })[];
  base: BasePricingInput;
  monthlyDiscounts: { ym: string; pct: number; ruleName: string }[];
};

type DocType = "DNI" | "CE" | "PASSPORT";

const initial: ReservationFormState = null;

const MESSAGE_MAX = 1000;
const NAME_MAX = 50;
const EMAIL_MAX = 254;
const NAME_PATTERN = "[\\p{L}][\\p{L} '.\\-]{1,49}";

const DOC_CONFIG: Record<
  DocType,
  {
    inputMode: "numeric" | "text";
    maxLength: number;
    pattern: string;
    placeholder: string;
    title: string;
    sanitize: (value: string) => string;
  }
> = {
  DNI: {
    inputMode: "numeric",
    maxLength: 8,
    pattern: "\\d{8}",
    placeholder: "12345678",
    title: "DNI de 8 dígitos",
    sanitize: (value) => value.replace(/\D/g, "").slice(0, 8),
  },
  CE: {
    inputMode: "numeric",
    maxLength: 9,
    pattern: "\\d{9}",
    placeholder: "123456789",
    title: "Carné de extranjería de 9 dígitos",
    sanitize: (value) => value.replace(/\D/g, "").slice(0, 9),
  },
  PASSPORT: {
    inputMode: "text",
    maxLength: 12,
    pattern: "[A-Za-z0-9]{6,12}",
    placeholder: "A1234567",
    title: "Pasaporte alfanumérico de 6 a 12 caracteres",
    sanitize: (value) => value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12).toUpperCase(),
  },
};

export function ReservationForm({ blockedIso, rules, base, monthlyDiscounts }: Props) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [docType, setDocType] = useState<DocType>("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState<number>(2);
  const [state, action, pending] = useActionState(submitReservation, initial);

  const checkIn = range?.from ? toIso(range.from) : "";
  const checkOut = range?.to ? toIso(range.to) : "";

  const stay = useMemo(() => {
    if (!range?.from || !range?.to) return null;
    return calculateStay(range.from, range.to, rules, base);
  }, [range, rules, base]);

  const tooShort = Boolean(stay && stay.nights < stay.minNightsRequired);
  const missingDates = !range?.from || !range?.to;
  const disabled = pending || missingDates || tooShort;

  const err = state && !state.ok ? state : null;
  const fe = err?.fieldErrors ?? {};

  const docCfg = DOC_CONFIG[docType];

  const handleDocTypeChange = (next: DocType) => {
    setDocType(next);
    setDocNumber((prev) => DOC_CONFIG[next].sanitize(prev));
  };

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-12" noValidate={false}>
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-3">
          <p className="tracking-label text-xs text-ink/60">1 · Elige tus fechas</p>
          <AvailabilityCalendar
            value={range}
            onChange={setRange}
            blockedIso={blockedIso}
            monthlyDiscounts={monthlyDiscounts}
          />
          <input type="hidden" name="checkIn" value={checkIn} />
          <input type="hidden" name="checkOut" value={checkOut} />
          {fe.checkIn ? <p className="text-sm text-rose-700">{fe.checkIn}</p> : null}
          {fe.checkOut ? <p className="text-sm text-rose-700">{fe.checkOut}</p> : null}
        </div>

        <div className="space-y-4">
          <p className="tracking-label text-xs text-ink/60">2 · Datos del titular</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de documento" error={fe.docType}>
              <select
                name="docType"
                value={docType}
                onChange={(e) => handleDocTypeChange(e.target.value as DocType)}
                className={selectCls}
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carné de extranjería</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
            </Field>
            <Field label="Número de documento" error={fe.docNumber}>
              <input
                name="docNumber"
                className={inputCls}
                value={docNumber}
                onChange={(e) => setDocNumber(docCfg.sanitize(e.target.value))}
                inputMode={docCfg.inputMode}
                maxLength={docCfg.maxLength}
                pattern={docCfg.pattern}
                placeholder={docCfg.placeholder}
                title={docCfg.title}
                autoComplete="off"
                spellCheck={false}
                required
              />
            </Field>
            <Field label="Apellidos" error={fe.lastName}>
              <input
                name="lastName"
                className={inputCls}
                value={lastName}
                onChange={(e) => setLastName(e.target.value.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
                minLength={2}
                pattern={NAME_PATTERN}
                title="Solo letras, espacios, apóstrofes o guiones"
                autoComplete="family-name"
                required
              />
            </Field>
            <Field label="Nombres" error={fe.firstName}>
              <input
                name="firstName"
                className={inputCls}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
                minLength={2}
                pattern={NAME_PATTERN}
                title="Solo letras, espacios, apóstrofes o guiones"
                autoComplete="given-name"
                required
              />
            </Field>
            <Field label="Correo" error={fe.email}>
              <input
                name="email"
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX))}
                maxLength={EMAIL_MAX}
                autoComplete="email"
                spellCheck={false}
                required
              />
            </Field>
            <Field label="Celular" error={fe.phone}>
              <PhoneInput inputClassName={inputCls} error={Boolean(fe.phone)} />
            </Field>
            <Field label="Huéspedes" error={fe.guests}>
              <input
                name="guests"
                type="number"
                min={1}
                max={15}
                step={1}
                value={guests}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isNaN(next)) return setGuests(1);
                  setGuests(Math.min(15, Math.max(1, Math.floor(next))));
                }}
                className={inputCls}
                required
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="tracking-label text-xs text-ink/60">3 · Mensaje (opcional)</p>
            <p className="text-[11px] text-ink/50 tabular-nums">
              {message.length}/{MESSAGE_MAX}
            </p>
          </div>
          <textarea
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
            maxLength={MESSAGE_MAX}
            className={cn(inputCls, "h-auto py-2")}
            placeholder="Cuéntanos si celebran algo, necesitan chef, transporte, etc."
          />
          {fe.message ? <p className="text-sm text-rose-700">{fe.message}</p> : null}
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent" required className="mt-1" />
            <span className="text-ink/75">
              Acepto las <a href="/politicas" className="underline">políticas de la casa</a> y
              el tratamiento de mis datos personales según la{" "}
              <a href="/politicas#privacidad" className="underline">política de privacidad</a>.
            </span>
          </label>
          {fe.consent ? <p className="text-sm text-rose-700">{fe.consent}</p> : null}
        </div>

        {err ? (
          <p className="text-sm text-rose-700 bg-rose/25 border border-rose/40 rounded-md px-3 py-2">
            {err.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={disabled}
          className="w-full md:w-auto rounded-full bg-ink text-bg tracking-label text-xs px-8 py-4 hover:bg-deep-ocean transition disabled:opacity-40"
        >
          {pending ? "Enviando solicitud…" : "Solicitar reserva"}
        </button>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <StaySummary stay={stay} />
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full h-10 rounded-md border border-line bg-white/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal invalid:border-rose-500/60";
const selectCls = inputCls + " appearance-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="tracking-label text-[11px] text-ink/70">{label}</span>
      {children}
      {error ? <span className="block text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}
