import type { Metadata } from "next";
import { defaultLocale, locales } from "@/i18n/config";
import type { Locale } from "@/types/i18n";

const fallbackSiteUrl = "http://localhost:3000";

export const siteName = "jobArm";
export const siteDescription = "Быстрые задачи, разовые заявки и подработка по всей Армении.";
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || fallbackSiteUrl);
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const localeMap: Record<Locale, string> = {
  hy: "hy_AM",
  ru: "ru_RU",
  en: "en_US",
  fa: "fa_IR",
  hi: "hi_IN",
};

function normalizePath(pathname: string): string {
  if (!pathname) {
    return "";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function localePath(locale: Locale, pathname = ""): string {
  const path = normalizePath(pathname);
  return path ? `/${locale}${path}` : `/${locale}`;
}

export function absoluteUrl(pathname: string): string {
  return new URL(normalizePath(pathname), siteUrl).toString();
}

export function localeAbsoluteUrl(locale: Locale, pathname = ""): string {
  return absoluteUrl(localePath(locale, pathname));
}

export function localeAlternates(pathname = ""): Metadata["alternates"] {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, localePath(locale, pathname)]),
  );

  return {
    canonical: localePath(defaultLocale, pathname),
    languages: {
      ...languages,
      "x-default": localePath(defaultLocale, pathname),
    },
  };
}

export function pageMetadata({
  locale,
  pathname = "",
  title,
  description,
  noIndex = false,
}: {
  locale: Locale;
  pathname?: string;
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const url = localeAbsoluteUrl(locale, pathname);

  return {
    title,
    description,
    alternates: {
      ...localeAlternates(pathname),
      canonical: localePath(locale, pathname),
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: localeMap[locale],
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : undefined,
  };
}
