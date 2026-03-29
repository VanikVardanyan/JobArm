"use client";

import { jobsListWithQuery, type JobsListQuery } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import { useJobsNav } from "@/features/jobs-list/ui/jobs-nav-provider";

type JobsSortBarProps = {
  locale: Locale;
  active: "new" | "old";
  filters: Pick<JobsListQuery, "category" | "region" | "urgent">;
  sortByLabel: string;
  newestLabel: string;
  oldestLabel: string;
};

export function JobsSortBar({
  locale,
  active,
  filters,
  sortByLabel,
  newestLabel,
  oldestLabel,
}: JobsSortBarProps) {
  const { navigate, isPending } = useJobsNav();

  const newestHref = jobsListWithQuery(locale, { ...filters });
  const oldestHref = jobsListWithQuery(locale, { ...filters, sort: "old" });

  const goNewest = () => {
    navigate(newestHref);
  };

  const goOldest = () => {
    navigate(oldestHref);
  };

  const baseBtn =
    "rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}>
        {sortByLabel}
      </span>
      <div className="inline-flex flex-wrap gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-1">
        <button
          type="button"
          disabled={isPending}
          onClick={goNewest}
          className={cn(
            baseBtn,
            active === "new" ? ui.langItemActive : ui.langItemIdle,
          )}
        >
          {newestLabel}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={goOldest}
          className={cn(
            baseBtn,
            active === "old" ? ui.langItemActive : ui.langItemIdle,
          )}
        >
          {oldestLabel}
        </button>
      </div>
    </div>
  );
}
