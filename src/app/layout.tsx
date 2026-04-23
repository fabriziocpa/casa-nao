import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { LodgingJsonLd } from "@/components/seo/LodgingJsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const OG_IMAGE = {
  url: "/images/POOL_NIGHT_OG.jpg",
  width: 1200,
  height: 900,
  alt: "CASA NAO — Piscina frente al mar de noche",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [OG_IMAGE.url],
  },
  alternates: { canonical: siteConfig.url },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Suspense>
          <LodgingJsonLd />
        </Suspense>
      </body>
    </html>
  );
}
