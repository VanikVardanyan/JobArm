"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { contactActionHref, normalizeContactMethod } from "@/lib/contact-links";
import { trackEvent } from "@/lib/analytics";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Locale } from "@/types/i18n";
import type { JobCategory, JobPublicAuthor, Region } from "@/types/jobs";

export type DbJob = JobPublicAuthor & {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: string | null;
  region: string;
  address: string;
  isUrgent: boolean;
  contactPhone: string;
  contactMethod: string;
  createdAt: Date;
};

type Props = {
  job: DbJob;
  locale: Locale;
  urgentLabel: string;
  titleLabel: string;
  budgetLabel: string;
  descriptionLabel: string;
  addressLabel: string;
  regionLabel: string;
  callLabel: string;
  telegramLabel: string;
  whatsappLabel: string;
  showMoreLabel: string;
  descriptionModalTitle: string;
  closeModalLabel: string;
};

function timeAgo(date: Date, locale: Locale): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (locale === "ru") {
    if (diff < 1) return "только что";
    if (diff < 60) return `${diff} мин назад`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `${h} ч назад` : `${Math.floor(h / 24)} д назад`;
  }
  if (locale === "hy") {
    if (diff < 1) return "հենց նոր";
    if (diff < 60) return `${diff} ր առաջ`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `${h} ժ առաջ` : `${Math.floor(h / 24)} օ առաջ`;
  }
  if (locale === "fa") {
    if (diff < 1) return "همین الان";
    if (diff < 60) return `${diff} دقیقه پیش`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `${h} ساعت پیش` : `${Math.floor(h / 24)} روز پیش`;
  }
  if (locale === "hi") {
    if (diff < 1) return "अभी";
    if (diff < 60) return `${diff} मिनट पहले`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `${h} घंटे पहले` : `${Math.floor(h / 24)} दिन पहले`;
  }
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

const CATEGORY_COLORS: Partial<Record<string, string>> = {
  loaders: "bg-blue-50 text-blue-700 border-blue-200",
  moving: "bg-violet-50 text-violet-700 border-violet-200",
  loading: "bg-sky-50 text-sky-700 border-sky-200",
  "home-help": "bg-green-50 text-green-700 border-green-200",
  cleaning: "bg-teal-50 text-teal-700 border-teal-200",
  repair: "bg-yellow-50 text-yellow-800 border-yellow-200",
  delivery: "bg-orange-50 text-orange-700 border-orange-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

export function JobCard({
  job,
  locale,
  urgentLabel,
  titleLabel,
  budgetLabel,
  descriptionLabel,
  addressLabel,
  regionLabel,
  callLabel,
  telegramLabel,
  whatsappLabel,
  showMoreLabel,
  descriptionModalTitle,
  closeModalLabel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [showMoreButton, setShowMoreButton] = useState(false);

  const catLabel = categoryLabels[job.category as JobCategory]?.[locale] ?? job.category;
  const regLabel = regionLabels[job.region as Region]?.[locale] ?? job.region;
  const catColor = CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS.other!;

  const method = normalizeContactMethod(job.contactMethod);
  const contactHref = contactActionHref(method, job.contactPhone);
  const contactPrimaryLabel =
    method === "whatsapp" ? whatsappLabel : method === "telegram" ? telegramLabel : callLabel;
  const contactLinkProps =
    method !== "phone"
      ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
      : {};

  const rawDescription = job.description?.trim() ?? "";

  const measureDescriptionOverflow = useCallback(() => {
    const el = descriptionRef.current;
    if (!el || rawDescription.length === 0) {
      setShowMoreButton(false);
      return;
    }
    const overflow = el.scrollHeight > el.clientHeight + 1;
    setShowMoreButton(overflow);
  }, [rawDescription]);

  useLayoutEffect(() => {
    measureDescriptionOverflow();
    const el = descriptionRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return;
    }
    const ro = new ResizeObserver(() => {
      measureDescriptionOverflow();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [measureDescriptionOverflow]);

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const handleContactClick = () => {
    trackEvent("contact_click", {
      contact_method: method,
      job_id: job.id,
      job_category: job.category,
      job_region: job.region,
      is_urgent: job.isUrgent,
      locale,
    });
  };

  return (
    <>
      <article className={cn(ui.panelDense, "flex flex-col gap-4 transition hover:shadow-lg")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", catColor)}>
              {catLabel}
            </span>
            {job.isUrgent && (
              <span className={ui.badgeAccentSoft}>{urgentLabel}</span>
            )}
          </div>
          <span className={cn("shrink-0 text-xs", ui.textMuted)}>
            {timeAgo(job.createdAt, locale)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
            {titleLabel}
          </span>
          <h2 className="text-base font-semibold leading-7">{job.title}</h2>
        </div>

        {rawDescription.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
              {descriptionLabel}
            </span>
            <p
              ref={descriptionRef}
              className={cn(
                "text-sm leading-7",
                ui.textMuted,
                "line-clamp-2 overflow-hidden break-words",
              )}
            >
              {rawDescription}
            </p>
            {showMoreButton ? (
              <button
                type="button"
                onClick={openModal}
                className="w-fit text-left text-sm font-semibold text-[color:var(--accent-strong)] underline-offset-4 transition hover:underline"
              >
                {showMoreLabel}
              </button>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {job.price && (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
                {budgetLabel}
              </span>
              <span className="font-medium text-[color:var(--foreground)]">{job.price}</span>
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
              {regionLabel}
            </span>
            <span className={ui.textMuted}>{regLabel}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
              {addressLabel}
            </span>
            <span className={ui.textMuted}>{job.address}</span>
          </div>
        </div>

        {(job.publicContactName ?? job.author.name) && (
          <p className={cn("text-xs", ui.textMuted)}>
            {job.publicContactName ?? job.author.name}
          </p>
        )}

        <a
          href={contactHref}
          onClick={handleContactClick}
          className={cn(ui.buttonPrimary, "mt-auto flex w-full flex-col items-center justify-center gap-1 py-3.5")}
          {...contactLinkProps}
        >
          <span className="text-center font-semibold leading-tight">{contactPrimaryLabel}</span>
          <span className="text-center text-xs font-medium opacity-90">{job.contactPhone}</span>
        </a>
      </article>

      {showMoreButton && rawDescription.length > 0 ? (
        <dialog
          ref={dialogRef}
          className={cn(
            ui.panelDense,
            "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border-[color:var(--border)] shadow-2xl backdrop:bg-black/50",
          )}
        >
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold leading-tight">{descriptionModalTitle}</h3>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">
              {rawDescription}
            </p>
            <form method="dialog">
              <button type="submit" className={cn(ui.buttonSecondary, "w-full")}>
                {closeModalLabel}
              </button>
            </form>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
