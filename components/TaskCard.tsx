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

const DESCRIPTION_TRUNCATE = 180;

export default function TaskCard({ task, isMine }: { task: Task; isMine: boolean }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLong = task.description.length > DESCRIPTION_TRUNCATE;
  const shortDesc = isLong && !expanded
    ? task.description.slice(0, DESCRIPTION_TRUNCATE).trimEnd() + "…"
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
      className={`group relative rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isMine
          ? "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-900 ring-2 ring-indigo-400/60 dark:ring-indigo-500/50 shadow-indigo-100/60 dark:shadow-indigo-900/20"
          : "bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-gray-300 dark:hover:ring-gray-700"
      }`}
    >
      {isMine && (
        <span className="self-start inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm">
          ✦ {t("myBadge")}
        </span>
      )}

      <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap break-words min-h-[3.5rem]">
        {shortDesc}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="self-start text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {expanded ? t("collapse") : t("readMore")}
        </button>
      )}

      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
        {task.budget ? (
          <span className="font-bold text-gray-900 dark:text-gray-100 pt-2">
            {task.budget.toLocaleString("ru-RU")} <span className="text-indigo-600 dark:text-indigo-400">֏</span>
          </span>
        ) : <span className="pt-2 text-gray-400 dark:text-gray-600 italic">—</span>}
        <span
          className="pt-2 text-gray-500 dark:text-gray-400"
          suppressHydrationWarning
        >
          {timeAgo(task.createdAt, t)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={`tel:${task.phone}`}
          aria-label={`${t("call")} ${formatPhoneDisplay(task.phone)}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {t("call")}
        </a>

        {isMine && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/edit/${task.id}`)}
              aria-label={t("edit")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t("edit")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label={t("delete")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
