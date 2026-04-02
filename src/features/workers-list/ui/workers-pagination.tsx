"use client";

import { workersListWithQuery, type WorkersListQuery } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import { useWorkersNav } from "@/features/workers-list/ui/workers-nav-provider";

type Props = {
  locale: Locale;
  currentPage: number;
  totalPages: number;
  baseQuery: WorkersListQuery;
  prevLabel: string;
  nextLabel: string;
  pageIndicatorTemplate: string;
};

function formatPageIndicator(template: string, current: number, total: number): string {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

export function WorkersPagination({
  locale,
  currentPage,
  totalPages,
  baseQuery,
  prevLabel,
  nextLabel,
  pageIndicatorTemplate,
}: Props) {
  const { navigate, isPending } = useWorkersNav();

  if (totalPages <= 1) {
    return null;
  }

  const prevHref = workersListWithQuery(locale, {
    ...baseQuery,
    page: currentPage - 1 > 1 ? currentPage - 1 : undefined,
  });
  const nextHref = workersListWithQuery(locale, {
    ...baseQuery,
    page: currentPage + 1,
  });

  const indicator = formatPageIndicator(pageIndicatorTemplate, currentPage, totalPages);
  const linkClass = cn("text-sm font-semibold text-[color:var(--accent-strong)] underline-offset-4 transition hover:underline disabled:opacity-40");

  return (
    <nav className="flex flex-wrap items-center justify-center gap-4 border-t border-[color:var(--border)] pt-6" aria-label="Pagination">
      {currentPage > 1 ? (
        <button type="button" disabled={isPending} onClick={() => navigate(prevHref)} className={linkClass}>
          {prevLabel}
        </button>
      ) : (
        <span className={cn("text-sm font-semibold opacity-40", ui.textMuted)} aria-hidden="true">{prevLabel}</span>
      )}
      <span className={`text-sm ${ui.textMuted}`}>{indicator}</span>
      {currentPage < totalPages ? (
        <button type="button" disabled={isPending} onClick={() => navigate(nextHref)} className={linkClass}>
          {nextLabel}
        </button>
      ) : (
        <span className={cn("text-sm font-semibold opacity-40", ui.textMuted)} aria-hidden="true">{nextLabel}</span>
      )}
    </nav>
  );
}
