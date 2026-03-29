"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RouteSpinner } from "@/components/route-spinner";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { Locale, TranslationTree } from "@/types/i18n";

const DATE_LOCALE: Record<Locale, string> = {
  hy: "hy-AM",
  ru: "ru-RU",
  en: "en-US",
  fa: "fa-IR",
  hi: "hi-IN",
};

type Job = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: string | null;
  region: string;
  status: string;
  isUrgent: boolean;
  createdAt: Date;
};

type Props = {
  jobs: Job[];
  locale: Locale;
  t: TranslationTree["dashboard"];
  urgentLabel: string;
};

export function MyJobsList({ jobs, locale, t, urgentLabel }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevPendingRef = useRef(false);

  useEffect(() => {
    if (prevPendingRef.current && !pending && loadingId !== null) {
      setLoadingId(null);
    }
    prevPendingRef.current = pending;
  }, [pending, loadingId]);

  const showOverlay = loadingId !== null || pending;

  async function handleDelete(id: string) {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLoadingId(null);
      setError(t.deleteError);
      return;
    }
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleToggleStatus(id: string, current: string) {
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: current === "active" ? "closed" : "active" }),
    });
    if (!res.ok) {
      setLoadingId(null);
      setError(t.updateError);
      return;
    }
    startTransition(() => {
      router.refresh();
    });
  }

  if (jobs.length === 0) {
    return (
      <div className={`${ui.panel} flex flex-col items-center gap-6 py-16 text-center`}>
        <p className={`text-lg ${ui.textMuted}`}>{t.empty}</p>
        <Link href={routes.post(locale)} className={ui.buttonDashboardPrimary}>
          {t.addJob}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {showOverlay ? (
        <div
          className="fixed inset-0 z-20 flex items-start justify-center bg-[color:var(--background)]/55 pt-[28vh] backdrop-blur-[3px]"
          aria-busy="true"
          aria-live="polite"
        >
          <RouteSpinner />
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {error ? (
          <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {jobs.map((job) => {
          const isActive = job.status === "active";
          const rowLoading = loadingId === job.id || pending;
          const descriptionText = job.description?.trim() ?? "";
          const hasDescription = descriptionText.length > 0;

          const toggleThis = () => {
            handleToggleStatus(job.id, job.status);
          };

          const deleteThis = () => {
            handleDelete(job.id);
          };

          return (
            <article
              key={job.id}
              className={cn(ui.panelDense, "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between")}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {isActive ? t.statusActive : t.statusClosed}
                  </span>
                  {job.isUrgent ? (
                    <span className={ui.badgeAccentSoft}>{urgentLabel}</span>
                  ) : null}
                </div>

                <h3 className="text-base font-semibold leading-7">{job.title}</h3>

                {hasDescription ? (
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}>
                      {t.description}
                    </span>
                    <p
                      className={`line-clamp-4 text-sm leading-relaxed break-words ${ui.textMuted}`}
                    >
                      {descriptionText}
                    </p>
                  </div>
                ) : null}

                <p className={`text-xs ${ui.textMuted}`}>
                  {job.category} · {job.region}
                  {job.price ? ` · ${job.price}` : ""}
                </p>

                <p className={`text-xs ${ui.textMuted}`}>
                  {new Date(job.createdAt).toLocaleDateString(DATE_LOCALE[locale])}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={routes.dashboardEditJob(locale, job.id)}
                  className={ui.buttonDashboardEdit}
                >
                  {t.editAction}
                </Link>

                <button
                  type="button"
                  onClick={toggleThis}
                  disabled={rowLoading}
                  className={ui.buttonDashboardToggle}
                >
                  {isActive ? t.closeAction : t.reopenAction}
                </button>

                <button
                  type="button"
                  onClick={deleteThis}
                  disabled={rowLoading}
                  className={ui.buttonDashboardDanger}
                >
                  {t.deleteAction}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
