"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { useOptionalJobsNav } from "@/features/jobs-list/ui/jobs-nav-provider";
import { parseCommaListParam } from "@/lib/query-filters";

type FilterItem = { key: string; label: string };

export type JobFiltersCopy = {
  categoriesTitle: string;
  regionsTitle: string;
  urgentLabel: string;
  clearFilters: string;
  applyFilters: string;
};

type Props = JobFiltersCopy & {
  categories: FilterItem[];
  regions: FilterItem[];
};

function setFromParam(value: string | null): Set<string> {
  return new Set(parseCommaListParam(value ?? undefined));
}

export function JobFilters({
  categories,
  regions,
  categoriesTitle,
  regionsTitle,
  urgentLabel,
  clearFilters,
  applyFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jobsNav = useOptionalJobsNav();

  const [categoryDraft, setCategoryDraft] = useState<Set<string>>(new Set());
  const [regionDraft, setRegionDraft] = useState<Set<string>>(new Set());
  const [urgentDraft, setUrgentDraft] = useState(false);

  const qs = searchParams.toString();

  useEffect(() => {
    setCategoryDraft(setFromParam(searchParams.get("category")));
    setRegionDraft(setFromParam(searchParams.get("region")));
    setUrgentDraft(searchParams.get("urgent") === "true");
  }, [qs, searchParams]);

  const activeCategory = searchParams.get("category");
  const activeRegion = searchParams.get("region");
  const activeUrgent = searchParams.get("urgent") === "true";

  const hasActiveFilters = Boolean(activeCategory || activeRegion || activeUrgent);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const q = params.toString();
      const href = (q ? `${pathname}?${q}` : pathname) as Route;
      if (jobsNav) {
        jobsNav.navigate(href);
      } else {
        router.push(href);
      }
    },
    [router, pathname, jobsNav],
  );

  const toggleInSet = (key: string, current: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(current);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setter(next);
  };

  const applyCategories = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryDraft.size === 0) {
      params.delete("category");
    } else {
      params.set("category", Array.from(categoryDraft).join(","));
    }
    params.delete("page");
    pushParams(params);
  }, [searchParams, categoryDraft, pushParams]);

  const applyRegions = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (regionDraft.size === 0) {
      params.delete("region");
    } else {
      params.set("region", Array.from(regionDraft).join(","));
    }
    params.delete("page");
    pushParams(params);
  }, [searchParams, regionDraft, pushParams]);

  const applyUrgent = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (urgentDraft) {
      params.set("urgent", "true");
    } else {
      params.delete("urgent");
    }
    params.delete("page");
    pushParams(params);
  }, [searchParams, urgentDraft, pushParams]);

  const clearAll = useCallback(() => {
    const href = pathname as Route;
    if (jobsNav) {
      jobsNav.navigate(href);
    } else {
      router.push(href);
    }
  }, [router, pathname, jobsNav]);

  const checkboxClass =
    "h-4 w-4 shrink-0 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]";

  return (
    <div className="flex flex-col gap-4">
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={clearAll}
          className={`w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-3 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted-hover)]`}
        >
          {clearFilters}
        </button>
      ) : null}

      <div className={ui.panelDense}>
        <p className={ui.eyebrow}>{categoriesTitle}</p>
        <div className="mt-4 flex flex-col gap-1">
          {categories.map(({ key, label }) => (
            <label
              key={key}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition",
                categoryDraft.has(key)
                  ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
                  : `${ui.textMuted} hover:bg-[color:var(--panel-muted)]`,
              )}
            >
              <input
                type="checkbox"
                checked={categoryDraft.has(key)}
                className={checkboxClass}
                onChange={() => toggleInSet(key, categoryDraft, setCategoryDraft)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button type="button" onClick={applyCategories} className={`mt-4 w-full ${ui.buttonPrimary}`}>
          {applyFilters}
        </button>
      </div>

      <div className={ui.panelDense}>
        <p className={ui.eyebrow}>{regionsTitle}</p>
        <div className="mt-4 flex flex-col gap-1">
          {regions.map(({ key, label }) => (
            <label
              key={key}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition",
                regionDraft.has(key)
                  ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
                  : `${ui.textMuted} hover:bg-[color:var(--panel-muted)]`,
              )}
            >
              <input
                type="checkbox"
                checked={regionDraft.has(key)}
                className={checkboxClass}
                onChange={() => toggleInSet(key, regionDraft, setRegionDraft)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button type="button" onClick={applyRegions} className={`mt-4 w-full ${ui.buttonPrimary}`}>
          {applyFilters}
        </button>
      </div>

      <div className={ui.panelDense}>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2">
          <input
            type="checkbox"
            checked={urgentDraft}
            className={checkboxClass}
            onChange={() => setUrgentDraft((v) => !v)}
          />
          <span
            className={cn(
              "text-sm font-semibold",
              urgentDraft ? "text-[color:var(--accent-strong)]" : ui.textMuted,
            )}
          >
            {urgentLabel}
          </span>
        </label>
        <button type="button" onClick={applyUrgent} className={`mt-4 w-full ${ui.buttonPrimary}`}>
          {applyFilters}
        </button>
      </div>
    </div>
  );
}
