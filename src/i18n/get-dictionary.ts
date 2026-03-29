import { defaultLocale, isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/types/i18n";

export function getLocale(input: string): Locale {
  return isLocale(input) ? input : defaultLocale;
}

export function getDictionary(locale: string) {
  return dictionaries[getLocale(locale)];
}
