"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { contactActionHref, normalizeContactMethod } from "@/lib/contact-links";
import { trackEvent } from "@/lib/analytics";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Locale } from "@/types/i18n";
import type { JobCategory, Region, ResumeRecord } from "@/types/jobs";

type Props = {
  resume: ResumeRecord;
  locale: Locale;
  titleLabel: string;
  rateLabel: string;
  descriptionLabel: string;
  regionLabel: string;
  callLabel: string;
  telegramLabel: string;
  whatsappLabel: string;
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

export function ResumeCard({
  resume,
  locale,
  titleLabel,
  rateLabel,
  descriptionLabel,
  regionLabel,
  callLabel,
  telegramLabel,
  whatsappLabel,
}: Props) {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [showFade, setShowFade] = useState(false);

  const rawDescription = resume.description?.trim() ?? "";
  const catLabel = categoryLabels[resume.category as JobCategory]?.[locale] ?? resume.category;
  const regLabel = regionLabels[resume.region as Region]?.[locale] ?? resume.region;
  const catColor = CATEGORY_COLORS[resume.category] ?? CATEGORY_COLORS.other!;

  const method = normalizeContactMethod(resume.contactMethod);
  const contactHref = contactActionHref(method, resume.contactPhone);
  const contactPrimaryLabel =
    method === "whatsapp" ? whatsappLabel : method === "telegram" ? telegramLabel : callLabel;
  const contactLinkProps =
    method !== "phone"
      ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
      : {};

  const measureDescriptionOverflow = useCallback(() => {
    const el = descriptionRef.current;
    if (!el || rawDescription.length === 0) {
      setShowFade(false);
      return;
    }

    setShowFade(el.scrollHeight > el.clientHeight + 1);
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
    return () => ro.disconnect();
  }, [measureDescriptionOverflow]);

  const handleContactClick = () => {
    trackEvent("resume_contact_click", {
      contact_method: method,
      resume_id: resume.id,
      resume_category: resume.category,
      resume_region: resume.region,
      locale,
    });
  };

  return (
    <article className={cn(ui.panelDense, "flex flex-col gap-4 transition hover:shadow-lg")}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", catColor)}>
          {catLabel}
        </span>
        <span className={cn("shrink-0 text-xs", ui.textMuted)}>
          {timeAgo(resume.createdAt, locale)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
          {titleLabel}
        </span>
        <h2 className="text-base font-semibold leading-7">{resume.title}</h2>
      </div>

      {rawDescription.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
            {descriptionLabel}
          </span>
          <div className="relative">
            <p
              ref={descriptionRef}
              className={cn("line-clamp-3 overflow-hidden break-words text-sm leading-7", ui.textMuted)}
            >
              {rawDescription}
            </p>
            {showFade ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[color:var(--surface-strong)] to-transparent" />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 text-sm">
        {resume.price ? (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
              {rateLabel}
            </span>
            <span className="font-medium text-[color:var(--foreground)]">{resume.price}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-[0.12em]", ui.textMuted)}>
            {regionLabel}
          </span>
          <span className={ui.textMuted}>{regLabel}</span>
        </div>
      </div>

      {(resume.publicContactName ?? resume.author.name) ? (
        <p className={cn("text-xs", ui.textMuted)}>
          {resume.publicContactName ?? resume.author.name}
        </p>
      ) : null}

      <a
        href={contactHref}
        onClick={handleContactClick}
        className={cn(ui.buttonPrimary, "mt-auto flex w-full flex-col items-center justify-center gap-1 py-3.5")}
        {...contactLinkProps}
      >
        <span className="text-center font-semibold leading-tight">{contactPrimaryLabel}</span>
        <span className="text-center text-xs font-medium opacity-90">{resume.contactPhone}</span>
      </a>
    </article>
  );
}
