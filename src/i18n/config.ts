import type { Locale } from "@/types/i18n";

export const locales = ["hy", "ru", "en", "fa", "hi"] as const;

export const defaultLocale = "hy";

export const localeLabels: Record<Locale, string> = {
  hy: "Հայ",
  ru: "Рус",
  en: "Eng",
  fa: "فا",
  hi: "हि",
};

/** Персидский интерфейс — RTL. */
export function isRtlLocale(locale: Locale): boolean {
  return locale === "fa";
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
