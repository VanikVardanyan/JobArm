"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ui } from "@/components/ui/styles";
import { routes } from "@/lib/routes";
import type { Locale } from "@/types/i18n";

type Props = {
  locale: Locale;
  dashboardLabel: string;
  createTaskLabel: string;
};

export function JobsPageActions({ locale, dashboardLabel, createTaskLabel }: Props) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-11 w-full sm:w-56 animate-pulse rounded-full bg-[color:var(--border)]" />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href={routes.dashboard(locale)} className={`inline-flex shrink-0 ${ui.buttonSecondary}`}>
        {dashboardLabel}
      </Link>
      <Link href={routes.post(locale)} className={`inline-flex shrink-0 ${ui.buttonPrimary}`} data-tour="jobs-create">
        {createTaskLabel}
      </Link>
    </div>
  );
}
