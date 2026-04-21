import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/galeria`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tour-virtual`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/politicas`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
