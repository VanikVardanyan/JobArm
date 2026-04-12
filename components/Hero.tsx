"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function Hero() {
  const t = useTranslations("home");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tasks/count")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { count: number }) => {
        if (!cancelled) setCount(typeof data.count === "number" ? data.count : 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hero-grid relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-5 py-6 sm:px-10 sm:py-16 overflow-hidden">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="relative flex flex-col gap-4 sm:gap-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 tabular-nums ${
              count === null ? "animate-pulse text-indigo-400/80" : ""
            }`}
          >
            {count === null ? "—" : count} {t("activeTasks")}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
          {t("heroTitle")}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg max-w-lg leading-relaxed">
          {t("heroSubtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/create"
            onClick={() =>
              trackEvent("cta_click", { location: "hero", target: "create" })
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm transition-colors"
          >
            {t("createButtonShort")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link
            href="/tasks"
            onClick={() =>
              trackEvent("cta_click", { location: "hero", target: "browse_tasks" })
            }
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t("browseTasks")}
          </Link>
        </div>
      </div>
    </section>
  );
}
