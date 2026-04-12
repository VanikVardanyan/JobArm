"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import ConfirmModal from "./ConfirmModal";

type Resume = {
  id: string;
  description: string;
  category: string;
  phone: string | null;
  createdAt: string;
  googleUser: { name: string | null; picture: string | null };
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

export default function ResumeCard({ resume, isMine }: { resume: Resume; isMine: boolean }) {
  const t = useTranslations("resume");
  const tHome = useTranslations("home");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLong = resume.description.length > DESCRIPTION_TRUNCATE;
  const shortDesc = isLong && !expanded
    ? resume.description.slice(0, DESCRIPTION_TRUNCATE).trimEnd() + "..."
    : resume.description;

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
    if (res.ok) {
      trackEvent("resume_delete");
      router.refresh();
      setConfirmOpen(false);
    }
    setDeleting(false);
  };

  return (
    <div
      className={`group relative rounded-lg flex flex-col transition-shadow duration-200 hover:shadow-md overflow-hidden ${
        isMine
          ? "bg-white dark:bg-slate-900/80 border-2 border-emerald-500/40 dark:border-emerald-500/30"
          : "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
        <div className="flex items-center gap-2">
          {isMine && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
              {t("myBadge")}
            </span>
          )}
          <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {tHome(`category.${resume.category}`)}
          </span>
          {resume.googleUser.name && (
            <div className="flex items-center gap-1.5">
              {resume.googleUser.picture && (
                <img
                  src={resume.googleUser.picture}
                  alt=""
                  className="w-5 h-5 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {resume.googleUser.name}
              </span>
            </div>
          )}
        </div>
        <span
          className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums"
          suppressHydrationWarning
        >
          {timeAgo(resume.createdAt, tHome)}
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
            className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {expanded ? tHome("collapse") : tHome("readMore")}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3.5 flex flex-col gap-2 mt-auto">
        {resume.phone ? (
          showPhone ? (
            <a
              href={`tel:${resume.phone}`}
              onClick={() => trackEvent("resume_contact_call")}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {formatPhoneDisplay(resume.phone)}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackEvent("resume_contact_reveal");
                setShowPhone(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {t("showPhone")}
            </button>
          )
        ) : (
          <div className="w-full flex items-center justify-center py-2 text-sm text-slate-400 dark:text-slate-600 italic">
            {t("noPhone")}
          </div>
        )}

        {isMine && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {t("delete")}
          </button>
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
