import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/api/",
    ...locales.flatMap((locale) => [`/${locale}/dashboard/`, `/${locale}/auth/`]),
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.toString(),
  };
}
