import type { Route } from "next";
import type { Locale } from "@/types/i18n";

/**
 * Сегменты путей под `/[locale]/…` (без ведущего слэша).
 */
export const LocaleRouteSegment = {
  jobs: "jobs",
  post: "post",
  dashboard: "dashboard",
  edit: "edit",
  auth: "auth",
  signIn: "signin",
} as const;

function toRoute(path: string): Route {
  return path as Route;
}

function underLocale(locale: Locale, ...segments: string[]): string {
  if (segments.length === 0) {
    return `/${locale}`;
  }
  return `/${locale}/${segments.join("/")}`;
}

/**
 * Готовые href для навигации и redirect (всегда с префиксом локали).
 */
export const routes = {
  home: (locale: Locale) => toRoute(underLocale(locale)),
  jobs: (locale: Locale) => toRoute(underLocale(locale, LocaleRouteSegment.jobs)),
  post: (locale: Locale) => toRoute(underLocale(locale, LocaleRouteSegment.post)),
  dashboard: (locale: Locale) => toRoute(underLocale(locale, LocaleRouteSegment.dashboard)),
  dashboardEditJob: (locale: Locale, jobId: string) =>
    toRoute(
      underLocale(locale, LocaleRouteSegment.dashboard, LocaleRouteSegment.edit, jobId),
    ),
  authSignIn: (locale: Locale) =>
    toRoute(underLocale(locale, LocaleRouteSegment.auth, LocaleRouteSegment.signIn)),
} as const;

export type JobsListQuery = {
  category?: string;
  region?: string;
  urgent?: string;
  /** Сначала старые — только `old`; новые по умолчанию (параметр не нужен). */
  sort?: "old";
  page?: number;
};

/**
 * Ссылка на `/[locale]/jobs` с сохранением фильтров, сортировки и страницы.
 */
export function jobsListWithQuery(locale: Locale, q: JobsListQuery): Route {
  const p = new URLSearchParams();
  if (q.category) {
    p.set("category", q.category);
  }
  if (q.region) {
    p.set("region", q.region);
  }
  if (q.urgent) {
    p.set("urgent", q.urgent);
  }
  if (q.sort === "old") {
    p.set("sort", "old");
  }
  if (q.page !== undefined && q.page > 1) {
    p.set("page", String(q.page));
  }
  const qs = p.toString();
  return toRoute(`/${locale}/${LocaleRouteSegment.jobs}${qs ? `?${qs}` : ""}`);
}
