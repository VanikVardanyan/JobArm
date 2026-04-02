"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { Locale, TranslationTree } from "@/types/i18n";

type Resume = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: string | null;
  region: string;
  status: string;
  createdAt: Date;
};

type Props = {
  resumes: Resume[];
  locale: Locale;
  t: TranslationTree["dashboard"];
};

export function MyResumesList({ resumes, locale, t }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm(t.confirmDelete)) return;
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLoadingId(null);
      setError(t.deleteResumeError);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function handleToggleStatus(id: string, current: string) {
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: current === "active" ? "closed" : "active" }),
    });
    if (!res.ok) {
      setLoadingId(null);
      setError(t.updateResumeError);
      return;
    }
    startTransition(() => router.refresh());
  }

  if (resumes.length === 0) {
    return (
      <div className={`${ui.panel} flex flex-col items-center gap-6 py-16 text-center`}>
        <p className={`text-lg ${ui.textMuted}`}>{t.emptyResumes}</p>
        <Link href={routes.workersPost(locale)} className={ui.buttonDashboardPrimary}>
          {t.addResume}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
      {resumes.map((resume) => {
        const isActive = resume.status === "active";
        const rowLoading = loadingId === resume.id || pending;
        return (
          <article key={resume.id} className={cn(ui.panelDense, "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between")}>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                  {isActive ? t.statusActive : t.statusClosed}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-7">{resume.title}</h3>
              {resume.description ? (
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}>{t.resumeDescription}</span>
                  <p className={`line-clamp-4 text-sm leading-relaxed ${ui.textMuted}`}>{resume.description}</p>
                </div>
              ) : null}
              <p className={`text-xs ${ui.textMuted}`}>{resume.category} · {resume.region}{resume.price ? ` · ${resume.price}` : ""}</p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href={routes.dashboardEditResume(locale, resume.id)} className={ui.buttonDashboardEdit}>
                {t.editAction}
              </Link>
              <button type="button" onClick={() => handleToggleStatus(resume.id, resume.status)} disabled={rowLoading} className={ui.buttonDashboardToggle}>
                {isActive ? t.closeAction : t.reopenAction}
              </button>
              <button type="button" onClick={() => handleDelete(resume.id)} disabled={rowLoading} className={ui.buttonDashboardDanger}>
                {t.deleteAction}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
