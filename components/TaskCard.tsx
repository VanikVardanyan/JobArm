"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getToken, removeToken } from "@/lib/tokens";
import ConfirmModal from "./ConfirmModal";

type Task = {
  id: string;
  description: string;
  budget: number | null;
  phone: string;
  createdAt: string;
};

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations>): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return t("justNow");
  if (hours < 1) return t("minutesAgo", { count: minutes });
  if (days < 1) return t("hoursAgo", { count: hours });
  return t("daysAgo", { count: days });
}

function formatPhoneDisplay(phone: string): string {
  const m = phone.match(/^\+374(\d{2})(\d{3})(\d{3})$/);
  if (!m) return phone;
  return `+374 ${m[1]} ${m[2]} ${m[3]}`;
}

const DESCRIPTION_TRUNCATE = 150;

export default function TaskCard({ task, isMine }: { task: Task; isMine: boolean }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLong = task.description.length > DESCRIPTION_TRUNCATE;
  const shortDesc = isLong && !expanded
    ? task.description.slice(0, DESCRIPTION_TRUNCATE).trimEnd() + "..."
    : task.description;

  const handleDelete = async () => {
    const token = getToken(task.id);
    if (!token) {
      setConfirmOpen(false);
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manageToken: token }),
    });
    if (res.ok) {
      removeToken(task.id);
      router.refresh();
    }
    setDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <div
      className={`group relative rounded-lg flex flex-col transition-shadow duration-200 hover:shadow-md overflow-hidden ${
        isMine
          ? "bg-white dark:bg-slate-900/80 border-2 border-indigo-500/40 dark:border-indigo-500/30"
          : "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Top bar: badge + time */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
        <div className="flex items-center gap-2">
          {isMine && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white">
              {t("myBadge")}
            </span>
          )}
          {task.budget ? (
            <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {task.budget.toLocaleString("ru-RU")}
              <span className="text-indigo-500 ml-0.5">&#1423;</span>
            </span>
          ) : (
            <span className="text-sm text-slate-400 dark:text-slate-600 italic">
              {t("noBudget")}
            </span>
          )}
        </div>
        <span
          className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums"
          suppressHydrationWarning
        >
          {timeAgo(task.createdAt, t)}
        </span>
      </div>

      {/* Description */}
      <div className="px-4 py-3 flex-1">
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {shortDesc}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {expanded ? t("collapse") : t("readMore")}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3.5 flex flex-col gap-2 mt-auto">
        {showPhone ? (
          <a
            href={`tel:${task.phone}`}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {formatPhoneDisplay(task.phone)}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {t("showPhone")}
          </button>
        )}

        {isMine && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/edit/${task.id}`)}
              aria-label={t("edit")}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t("edit")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label={t("delete")}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {t("delete")}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setConfirmOpen(false)}
      />
    </div>
  );
}
