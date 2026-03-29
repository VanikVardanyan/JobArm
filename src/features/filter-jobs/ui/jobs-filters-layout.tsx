"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { JobFilters, type JobFiltersCopy } from "@/features/filter-jobs/ui/job-filters";
import { ui } from "@/components/ui/styles";
type FilterItem = { key: string; label: string };

type JobsFiltersLayoutProps = {
  children: React.ReactNode;
  categories: FilterItem[];
  regions: FilterItem[];
  openFilters: string;
  filtersTitle: string;
} & JobFiltersCopy;

export function JobsFiltersLayout({
  children,
  categories,
  regions,
  openFilters,
  filtersTitle,
  categoriesTitle,
  regionsTitle,
  urgentLabel,
  clearFilters,
  applyFilters,
}: JobsFiltersLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filterProps: JobFiltersCopy & {
    categories: FilterItem[];
    regions: FilterItem[];
  } = {
    categories,
    regions,
    categoriesTitle,
    regionsTitle,
    urgentLabel,
    clearFilters,
    applyFilters,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted-hover)]`}
        >
          {openFilters}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <JobFilters {...filterProps} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">{children}</div>
      </div>

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content
            className={`fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[88vh] flex-col rounded-t-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 pb-8 pt-3 outline-none ${ui.textMuted}`}
          >
            <Drawer.Title className="sr-only">{filtersTitle}</Drawer.Title>
            <Drawer.Handle className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-[color:var(--border)]" />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <JobFilters {...filterProps} onApplied={() => setDrawerOpen(false)} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
