import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import type { Locale } from "@/types/i18n";
import { localeAbsoluteUrl } from "@/lib/seo";

const publicRoutes = ["", "/jobs", "/post", "/workers", "/workers/post"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.flatMap((locale) =>
    publicRoutes.map((pathname) => ({
      url: localeAbsoluteUrl(locale as Locale, pathname),
      lastModified: now,
      changeFrequency: pathname === "" ? "weekly" : "daily",
      priority: pathname === "" ? 1 : 0.8,
    })),
  );
}
