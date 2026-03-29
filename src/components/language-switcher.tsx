"use client";

import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { localeLabels, locales } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import type { LanguageSwitcherProps } from "@/types/props";

function buildLocaleBasePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  segments[1] = locale;

  return segments.join("/") || `/${locale}`;
}

function LocaleLinks({
  currentLocale,
  getHref,
}: {
  currentLocale: Locale;
  getHref: (locale: Locale) => Route;
}) {
  return (
    <div className={ui.langWrap}>
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={getHref(locale)}
            className={cn(ui.langItem, active ? ui.langItemActive : ui.langItemIdle)}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}

function LanguageSwitcherWithQuery({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  function getHref(locale: Locale): Route {
    const base = buildLocaleBasePath(pathname, locale);
    const href = query ? `${base}?${query}` : base;
    return href as Route;
  }

  return <LocaleLinks currentLocale={currentLocale} getHref={getHref} />;
}

function LanguageSwitcherFallback({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  function getHref(locale: Locale): Route {
    return buildLocaleBasePath(pathname, locale) as Route;
  }

  return <LocaleLinks currentLocale={currentLocale} getHref={getHref} />;
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback {...props} />}>
      <LanguageSwitcherWithQuery {...props} />
    </Suspense>
  );
}
