"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import ResumeCard from "./ResumeCard";
import { trackEvent } from "@/lib/analytics";

type Resume = {
  id: string;
  description: string;
  category: string;
  phone: string | null;
  createdAt: string;
  googleUserId: string;
  isMine?: boolean;
  googleUser: { name: string | null; picture: string | null };
};

type Pagination = {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  category?: string;
};

const CATEGORIES = ["all", "loader", "restaurant_food", "services", "craft", "other"] as const;

function buildPageHref(basePath: string, page: number, category?: string): Route {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return (query ? `${basePath}?${query}` : basePath) as Route;
}

export default function ResumeList({
  resumes,
  pagination,
  activeCategory = "all",
  showFilters = true,
}: {
  resumes: Resume[];
  pagination?: Pagination;
  activeCategory?: string;
  showFilters?: boolean;
}) {
  const t = useTranslations("resume");
  const tHome = useTranslations("home");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const count = resumes.filter((r) => r.description.toLowerCase().includes(lower)).length;
      trackEvent("resume_search", { results_count: count });
    }, 900);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, resumes]);

  const filtered = search.trim()
    ? resumes.filter((r) => r.description.toLowerCase().includes(search.toLowerCase()))
    : resumes;

  return (
    <section id="resumes">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("listTitle")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pagination?.total ?? resumes.length} {t("activeResumes")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
            />
          </div>
          <Link
            href="/resumes/create"
            onClick={() => trackEvent("cta_click", { location: "resume_list", target: "create_resume" })}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">{t("createButton")}</span>
          </Link>
        </div>
      </div>

      {/* Category filters */}
      {showFilters && <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={buildPageHref("/resumes", 1, category)}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === category
                ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {tHome(`category.${category}`)}
          </Link>
        ))}
      </div>}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {search.trim() ? t("noResults") : t("noResumes")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} isMine={resume.isMine ?? false} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="mt-7 flex items-center justify-center gap-2" aria-label={tHome("pagination")}>
          <Link
            href={buildPageHref(pagination.basePath, Math.max(1, pagination.page - 1), pagination.category)}
            aria-disabled={pagination.page <= 1}
            className={`px-3 py-2 rounded-md border text-sm ${
              pagination.page <= 1
                ? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {tHome("prevPage")}
          </Link>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((page) => page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1)
            .map((page, index, pages) => {
              const previous = pages[index - 1];
              return (
                <span key={page} className="contents">
                  {previous && page - previous > 1 && (
                    <span className="px-1 text-sm text-slate-400">...</span>
                  )}
                  <Link
                    href={buildPageHref(pagination.basePath, page, pagination.category)}
                    className={`min-w-9 px-3 py-2 rounded-md border text-center text-sm ${
                      page === pagination.page
                        ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </Link>
                </span>
              );
            })}
          <Link
            href={buildPageHref(pagination.basePath, Math.min(pagination.totalPages, pagination.page + 1), pagination.category)}
            aria-disabled={pagination.page >= pagination.totalPages}
            className={`px-3 py-2 rounded-md border text-sm ${
              pagination.page >= pagination.totalPages
                ? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {tHome("nextPage")}
          </Link>
        </nav>
      )}
    </section>
  );
}
