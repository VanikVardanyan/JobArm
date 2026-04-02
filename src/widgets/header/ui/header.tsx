"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Drawer } from "vaul";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInButton } from "@/features/auth/ui/sign-in-button";
import { UserMenu } from "@/features/auth/ui/user-menu";
import { routes } from "@/lib/routes";
import type { Locale } from "@/types/i18n";
import { ui } from "@/components/ui/styles";

type Props = {
  locale: Locale;
  signInLabel: string;
  signOutLabel: string;
  browseTasksLabel: string;
  browseWorkersLabel: string;
  productName: string;
  dashboardLabel: string;
  themeToggleLight: string;
  themeToggleDark: string;
  openMenuLabel: string;
  closeMenuLabel: string;
};

function BrandLogo({ label }: { label: string }) {
  return (
    <svg width="124" height="28" viewBox="0 0 124 28" fill="none" role="img" aria-label={label} className="h-7 w-auto">
      <rect x="1" y="1" width="26" height="26" rx="9" fill="var(--foreground)" />
      <path
        d="M9.5 7.5C7.567 7.5 6 9.067 6 11v6.75C6 21.754 9.246 25 13.25 25h5.25C20.433 25 22 23.433 22 21.5v-6.75C22 10.746 18.754 7.5 14.75 7.5H9.5Z"
        fill="var(--foreground)"
        opacity=".14"
      />
      <path
        d="M10.75 6C8.679 6 7 7.679 7 9.75V17c0 3.314 2.686 6 6 6h5.25c2.071 0 3.75-1.679 3.75-3.75V12c0-3.314-2.686-6-6-6h-5.25Z"
        fill="var(--foreground-on-dark)"
      />
      <path
        d="M13.25 8.5c0-1.243 1.007-2.25 2.25-2.25h3.188C20.517 6.25 22 7.733 22 9.563V12.5h-6.5c-1.243 0-2.25-1.007-2.25-2.25V8.5Z"
        fill="var(--accent)"
      />
      <path
        d="M10 17.938c0-1.76 1.427-3.188 3.188-3.188H18v3.563c0 3.418-2.77 6.187-6.188 6.187H10v-6.562Z"
        fill="var(--accent)"
      />
      <circle cx="20.5" cy="20.5" r="4.5" fill="var(--success)" />
      <path
        d="m18.25 20.5 1.4 1.4 3.1-3.1"
        stroke="var(--foreground-on-dark)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="35"
        y="19"
        fill="var(--foreground)"
        fontSize="18"
        fontWeight="700"
        letterSpacing="-0.04em"
        style={{ fontFamily: "Manrope, Segoe UI, sans-serif" }}
      >
        job<tspan fill="var(--accent)">Arm</tspan>
      </text>
    </svg>
  );
}

export function Header({
  locale,
  signInLabel,
  signOutLabel,
  browseTasksLabel,
  browseWorkersLabel,
  productName,
  dashboardLabel,
  themeToggleLight,
  themeToggleDark,
  openMenuLabel,
  closeMenuLabel,
}: Props) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const authBlock =
    status === "loading" ? (
      <div className="h-9 w-20 animate-pulse rounded-full bg-[color:var(--border)]" />
    ) : session ? (
      <UserMenu
        name={session.user?.name}
        image={session.user?.image}
        locale={locale}
        signOutLabel={signOutLabel}
        dashboardLabel={dashboardLabel}
      />
    ) : (
      <SignInButton label={signInLabel} callbackUrl={routes.dashboard(locale)} />
    );

  const authBlockStacked =
    status === "loading" ? (
      <div className="h-9 w-full animate-pulse rounded-full bg-[color:var(--border)]" />
    ) : session ? (
      <UserMenu
        name={session.user?.name}
        image={session.user?.image}
        locale={locale}
        signOutLabel={signOutLabel}
        dashboardLabel={dashboardLabel}
        stacked
      />
    ) : (
      <SignInButton
        label={signInLabel}
        callbackUrl={routes.dashboard(locale)}
        className="w-full justify-center gap-2"
      />
    );

  return (
    <header className="sticky top-4 z-10 glass-panel flex items-center justify-between rounded-[1.75rem] border border-[color:var(--border)] px-4 py-3 sm:px-5">
      <Link
        href={routes.home(locale)}
        className="flex min-w-0 shrink items-center gap-2"
        aria-label={productName}
        data-tour="header-brand"
      >
        <BrandLogo label={productName} />
      </Link>

      <div className="hidden items-center gap-2 md:gap-3 lg:flex">
        <Link href={routes.jobs(locale)} className={ui.buttonSecondary}>
          {browseTasksLabel}
        </Link>
        <Link href={routes.workers(locale)} className={ui.buttonSecondary}>
          {browseWorkersLabel}
        </Link>
        <ThemeToggle themeLightLabel={themeToggleLight} themeDarkLabel={themeToggleDark} />
        <LanguageSwitcher currentLocale={locale} />
        {authBlock}
      </div>

      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted-hover)] lg:hidden"
        onClick={() => setMenuOpen(true)}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav-drawer"
        aria-label={openMenuLabel}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Drawer.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 lg:hidden" />
          <Drawer.Content
            id="mobile-nav-drawer"
            className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[90vh] flex-col rounded-t-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 pb-8 pt-3 outline-none lg:hidden"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">{closeMenuLabel}</Drawer.Title>
            <Drawer.Handle className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-[color:var(--border)]" />
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[color:var(--muted)]">{openMenuLabel}</span>
                <ThemeToggle themeLightLabel={themeToggleLight} themeDarkLabel={themeToggleDark} />
              </div>
              <Link href={routes.jobs(locale)} className={`${ui.buttonSecondary} w-full justify-center`}>
                {browseTasksLabel}
              </Link>
              <Link href={routes.workers(locale)} className={`${ui.buttonSecondary} w-full justify-center`}>
                {browseWorkersLabel}
              </Link>
              <LanguageSwitcher currentLocale={locale} />
              {authBlockStacked}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </header>
  );
}
