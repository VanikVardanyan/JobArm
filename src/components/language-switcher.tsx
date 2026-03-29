"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { localeLabels, locales } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import type { LanguageSwitcherProps } from "@/types/props";

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getLocaleHref(locale: Locale): Route {
    const segments = pathname.split("/");
    segments[1] = locale;

    const nextPath = segments.join("/") || `/${locale}`;
    const query = searchParams.toString();

    const href = query ? `${nextPath}?${query}` : nextPath;
    return href as Route;
  }

  return (
    <div className={ui.langWrap}>
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={getLocaleHref(locale)}
            className={cn(ui.langItem, active ? ui.langItemActive : ui.langItemIdle)}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
