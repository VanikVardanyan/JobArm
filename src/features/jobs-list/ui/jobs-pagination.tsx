"use client";

import { jobsListWithQuery, type JobsListQuery } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import { useJobsNav } from "@/features/jobs-list/ui/jobs-nav-provider";

type JobsPaginationProps = {
  locale: Locale;
  currentPage: number;
  totalPages: number;
  baseQuery: JobsListQuery;
  prevLabel: string;
  nextLabel: string;
  pageIndicatorTemplate: string;
};

function formatPageIndicator(template: string, current: number, total: number): string {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

export function JobsPagination({
  locale,
  currentPage,
  totalPages,
  baseQuery,
  prevLabel,
  nextLabel,
  pageIndicatorTemplate,
}: JobsPaginationProps) {
  const { navigate, isPending } = useJobsNav();

  if (totalPages <= 1) {
    return null;
  }

  const prevPageNum = currentPage - 1;
  const nextPageNum = currentPage + 1;

  const prevHref = jobsListWithQuery(locale, {
    ...baseQuery,
    page: prevPageNum > 1 ? prevPageNum : undefined,
  });
  const nextHref = jobsListWithQuery(locale, {
    ...baseQuery,
    page: nextPageNum > 1 ? nextPageNum : undefined,
  });

  const indicator = formatPageIndicator(pageIndicatorTemplate, currentPage, totalPages);

  const goPrev = () => {
    navigate(prevHref);
  };

  const goNext = () => {
    navigate(nextHref);
  };

  const linkClass = cn(
    "text-sm font-semibold text-[color:var(--accent-strong)] underline-offset-4 transition hover:underline disabled:opacity-40",
  );

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-4 border-t border-[color:var(--border)] pt-6"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <button
          type="button"
          disabled={isPending}
          onClick={goPrev}
          className={linkClass}
        >
          {prevLabel}
        </button>
      ) : (
        <span className={cn("text-sm font-semibold opacity-40", ui.textMuted)} aria-hidden="true">
          {prevLabel}
        </span>
      )}
      <span className={`text-sm ${ui.textMuted}`}>{indicator}</span>
      {currentPage < totalPages ? (
        <button
          type="button"
          disabled={isPending}
          onClick={goNext}
          className={linkClass}
        >
          {nextLabel}
        </button>
      ) : (
        <span className={cn("text-sm font-semibold opacity-40", ui.textMuted)} aria-hidden="true">
          {nextLabel}
        </span>
      )}
    </nav>
  );
}
