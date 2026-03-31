"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jobsListWithQuery, type JobsListQuery } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import { useJobsNav } from "@/features/jobs-list/ui/jobs-nav-provider";
import { RouteSpinner } from "@/components/route-spinner";

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
  const router = useRouter();
  const { navigate, isPending } = useJobsNav();
  const [optimisticActive, setOptimisticActive] = useState(active);

  const newestHref = jobsListWithQuery(locale, { ...filters });
  const oldestHref = jobsListWithQuery(locale, { ...filters, sort: "old" });

  useEffect(() => {
    router.prefetch(newestHref);
    router.prefetch(oldestHref);
  }, [router, newestHref, oldestHref]);

  useEffect(() => {
    setOptimisticActive(active);
  }, [active]);

  const goNewest = () => {
    setOptimisticActive("new");
    navigate(newestHref);
  };

  const goOldest = () => {
    setOptimisticActive("old");
    navigate(oldestHref);
  };

  const baseBtn =
    "rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}>
          {sortByLabel}
        </span>
        {isPending ? <RouteSpinner className="h-4 w-4 border-[1.5px]" /> : null}
      </div>
      <div className="inline-flex flex-wrap gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-1">
        <button
          type="button"
          disabled={isPending}
          onClick={goNewest}
          className={cn(
            baseBtn,
            optimisticActive === "new" ? ui.langItemActive : ui.langItemIdle,
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
            optimisticActive === "old" ? ui.langItemActive : ui.langItemIdle,
          )}
        >
          {oldestLabel}
        </button>
      </div>
    </div>
  );
}
