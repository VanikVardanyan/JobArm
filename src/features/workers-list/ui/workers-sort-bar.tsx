"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workersListWithQuery, type WorkersListQuery } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/styles";
import type { Locale } from "@/types/i18n";
import { RouteSpinner } from "@/components/route-spinner";
import { useWorkersNav } from "@/features/workers-list/ui/workers-nav-provider";

type WorkersSortBarProps = {
  locale: Locale;
  active: "new" | "old";
  filters: Pick<WorkersListQuery, "category" | "region">;
  sortByLabel: string;
  newestLabel: string;
  oldestLabel: string;
};

export function WorkersSortBar({
  locale,
  active,
  filters,
  sortByLabel,
  newestLabel,
  oldestLabel,
}: WorkersSortBarProps) {
  const router = useRouter();
  const { navigate, isPending } = useWorkersNav();
  const [optimisticActive, setOptimisticActive] = useState(active);

  const newestHref = workersListWithQuery(locale, { ...filters });
  const oldestHref = workersListWithQuery(locale, { ...filters, sort: "old" });

  useEffect(() => {
    router.prefetch(newestHref);
    router.prefetch(oldestHref);
  }, [router, newestHref, oldestHref]);

  useEffect(() => {
    setOptimisticActive(active);
  }, [active]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}>{sortByLabel}</span>
        {isPending ? <RouteSpinner className="h-4 w-4 border-[1.5px]" /> : null}
      </div>
      <div className="inline-flex flex-wrap gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-1">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setOptimisticActive("new");
            navigate(newestHref);
          }}
          className={cn("rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50", optimisticActive === "new" ? ui.langItemActive : ui.langItemIdle)}
        >
          {newestLabel}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setOptimisticActive("old");
            navigate(oldestHref);
          }}
          className={cn("rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50", optimisticActive === "old" ? ui.langItemActive : ui.langItemIdle)}
        >
          {oldestLabel}
        </button>
      </div>
    </div>
  );
}
