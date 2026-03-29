import type { ReactNode } from "react";
import type { Route } from "next";
import type { Locale } from "@/types/i18n";

export type LocaleRouteParams = {
  locale: string;
};

export type LocalePageProps = {
  params: Promise<LocaleRouteParams>;
};

export type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<LocaleRouteParams>;
};

export type LanguageSwitcherProps = {
  currentLocale: Locale;
};

export type SectionLinkProps = {
  href: Route;
  label: string;
};
