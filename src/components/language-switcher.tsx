import Link from "next/link";
import { localeLabels, locales } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { ui } from "@/components/ui/styles";
import type { LanguageSwitcherProps } from "@/types/props";

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  return (
    <div className={ui.langWrap}>
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={routes.home(locale)}
            className={cn(ui.langItem, active ? ui.langItemActive : ui.langItemIdle)}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
