export const siteConfig = {
  name: "CASA NAO",
  tagline: "LUXURY LIVING",
  description:
    "CASA NAO — refugio de lujo frente al mar en El Ñuro, Piura. Reserva tu estadía.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://casanao.com",
  locale: "es-PE",
  currency: "USD",
  defaultWhatsApp: "+51916021799",
  defaultContactEmail: "casanaoperu@gmail.com",
  maxGuests: 15,
  baseNightlyCents: 50000,
  lowSeasonMinNights: 2,
  highSeasonMinNights: 3,
} as const;
