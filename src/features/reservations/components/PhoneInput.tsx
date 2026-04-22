"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Country = {
  iso: string;
  name: string;
  dial: string;
  placeholder: string;
};

const COUNTRIES: Country[] = [
  { iso: "PE", name: "Perú", dial: "51", placeholder: "9XXXXXXXX" },
  { iso: "AR", name: "Argentina", dial: "54", placeholder: "11XXXXXXXX" },
  { iso: "BO", name: "Bolivia", dial: "591", placeholder: "7XXXXXXX" },
  { iso: "BR", name: "Brasil", dial: "55", placeholder: "11XXXXXXXXX" },
  { iso: "CA", name: "Canadá", dial: "1", placeholder: "XXXXXXXXXX" },
  { iso: "CL", name: "Chile", dial: "56", placeholder: "9XXXXXXXX" },
  { iso: "CO", name: "Colombia", dial: "57", placeholder: "3XXXXXXXXX" },
  { iso: "CR", name: "Costa Rica", dial: "506", placeholder: "XXXXXXXX" },
  { iso: "EC", name: "Ecuador", dial: "593", placeholder: "9XXXXXXXX" },
  { iso: "ES", name: "España", dial: "34", placeholder: "6XXXXXXXX" },
  { iso: "US", name: "Estados Unidos", dial: "1", placeholder: "XXXXXXXXXX" },
  { iso: "FR", name: "Francia", dial: "33", placeholder: "6XXXXXXXXX" },
  { iso: "DE", name: "Alemania", dial: "49", placeholder: "15XXXXXXXXX" },
  { iso: "IT", name: "Italia", dial: "39", placeholder: "3XXXXXXXXX" },
  { iso: "MX", name: "México", dial: "52", placeholder: "55XXXXXXXX" },
  { iso: "NL", name: "Países Bajos", dial: "31", placeholder: "6XXXXXXXX" },
  { iso: "PA", name: "Panamá", dial: "507", placeholder: "6XXXXXXX" },
  { iso: "PY", name: "Paraguay", dial: "595", placeholder: "9XXXXXXXX" },
  { iso: "PT", name: "Portugal", dial: "351", placeholder: "9XXXXXXXX" },
  { iso: "GB", name: "Reino Unido", dial: "44", placeholder: "7XXXXXXXXX" },
  { iso: "DO", name: "Rep. Dominicana", dial: "1", placeholder: "XXXXXXXXXX" },
  { iso: "UY", name: "Uruguay", dial: "598", placeholder: "9XXXXXXX" },
  { iso: "VE", name: "Venezuela", dial: "58", placeholder: "4XXXXXXXXX" },
];

const DEFAULT_DIAL = "51";

type Props = {
  inputClassName: string;
  defaultValue?: string;
  error?: boolean;
};

export function PhoneInput({ inputClassName, defaultValue, error }: Props) {
  const parsed = useMemo(() => parseInitial(defaultValue), [defaultValue]);
  const [dial, setDial] = useState<string>(parsed.dial);
  const [national, setNational] = useState<string>(parsed.national);

  const combined = `+${dial}${national.replace(/\D/g, "")}`;
  const active = COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];

  return (
    <div className="flex">
      <select
        aria-label="Código de país"
        value={dial}
        onChange={(e) => setDial(e.target.value)}
        className={cn(
          "inline-flex items-center rounded-l-md border border-r-0 border-line bg-sand/40 text-sm text-ink/80 px-2 h-10 focus:outline-none focus:ring-2 focus:ring-teal",
          error && "border-rose-500/60",
        )}
      >
        {COUNTRIES.map((c) => (
          <option key={`${c.iso}-${c.dial}`} value={c.dial}>
            {c.iso} +{c.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={national}
        onChange={(e) => setNational(e.target.value.replace(/\D/g, ""))}
        placeholder={active.placeholder}
        className={cn(inputClassName, "rounded-l-none")}
        required
      />
      <input type="hidden" name="phone" value={combined} />
    </div>
  );
}

function parseInitial(value?: string): { dial: string; national: string } {
  if (!value) return { dial: DEFAULT_DIAL, national: "" };
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    const match = COUNTRIES.map((c) => c.dial)
      .sort((a, b) => b.length - a.length)
      .find((d) => digits.startsWith(d));
    if (match) return { dial: match, national: digits.slice(match.length) };
    return { dial: DEFAULT_DIAL, national: digits };
  }
  return { dial: DEFAULT_DIAL, national: trimmed.replace(/\D/g, "") };
}
