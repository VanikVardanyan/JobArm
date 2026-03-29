"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { Locale } from "@/types/i18n";

type Props = {
  name: string | null | undefined;
  image: string | null | undefined;
  locale: Locale;
  signOutLabel: string;
  dashboardLabel: string;
  stacked?: boolean;
};

export function UserMenu({ name, image, locale, signOutLabel, dashboardLabel, stacked }: Props) {
  return (
    <div className={cn("flex gap-2", stacked ? "flex-col items-stretch" : "flex-row items-center")}>
      {image ? (
        <Image
          src={image}
          alt={name ?? ""}
          width={32}
          height={32}
          className="rounded-full border border-[color:var(--border)]"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-xs font-bold text-[color:var(--accent-strong)]">
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <Link
        href={routes.dashboard(locale)}
        className={ui.buttonSecondary}
      >
        {dashboardLabel}
      </Link>

      <button onClick={() => signOut()} className={ui.buttonSecondary}>
        {signOutLabel}
      </button>
    </div>
  );
}
