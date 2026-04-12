"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import TaskCard from "./TaskCard";
import { isMyTask } from "@/lib/tokens";
import { trackEvent } from "@/lib/analytics";

type Task = {
  id: string;
  description: string;
  category: string;
  budget: number | null;
  phone: string;
  createdAt: string;
  isMine?: boolean;
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

export default function TaskList({
  tasks,
  pagination,
  activeCategory = "all",
  showFilters = true,
}: {
  tasks: Task[];
  pagination?: Pagination;
  activeCategory?: string;
  showFilters?: boolean;
}) {
  const t = useTranslations("home");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myTasks = useMemo(
    () => new Set(tasks.filter((task) => task.isMine || isMyTask(task.id)).map((task) => task.id)),
    [tasks]
  );

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const count = tasks.filter((t) => t.description.toLowerCase().includes(lower)).length;
      trackEvent("task_search", { results_count: count });
    }, 900);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, tasks]);

  const filtered = search.trim()
    ? tasks.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  return (
    <section id="tasks">
      {/* Section header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("taskListTitle")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pagination?.total ?? tasks.length} {t("activeTasks")}
          </p>
        </div>
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
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={buildPageHref("/tasks", 1, category)}
              className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === category
                  ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {t(`category.${category}`)}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {search.trim() ? t("noResults") : t("noTasks")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} isMine={myTasks.has(task.id)} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav className="mt-7 flex items-center justify-center gap-2" aria-label={t("pagination")}>
          <Link
            href={buildPageHref(pagination.basePath, Math.max(1, pagination.page - 1), pagination.category)}
            aria-disabled={pagination.page <= 1}
            className={`px-3 py-2 rounded-md border text-sm ${
              pagination.page <= 1
                ? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {t("prevPage")}
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
            {t("nextPage")}
          </Link>
        </nav>
      )}
    </section>
  );
}
