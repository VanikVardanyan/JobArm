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

type Props = {
  locale: Locale;
  signInLabel: string;
  signOutLabel: string;
  productName: string;
  dashboardLabel: string;
  themeToggleLight: string;
  themeToggleDark: string;
  openMenuLabel: string;
  closeMenuLabel: string;
};

export function Header({
  locale,
  signInLabel,
  signOutLabel,
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
      <SignInButton label={signInLabel} callbackUrl={routes.post(locale)} />
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
      <SignInButton label={signInLabel} callbackUrl={routes.post(locale)} className="w-full justify-center gap-2" />
    );

  return (
    <header className="sticky top-4 z-10 glass-panel flex items-center justify-between rounded-[1.75rem] border border-[color:var(--border)] px-4 py-3 sm:px-5">
      <Link
        href={routes.home(locale)}
        className="flex min-w-0 shrink items-center gap-2"
        aria-label={productName}
      >
        <span className="text-lg font-bold tracking-tight text-[color:var(--foreground)]">
          job<span className="text-[color:var(--accent)]">Now</span>
        </span>
      </Link>

      <div className="hidden items-center gap-2 md:gap-3 lg:flex">
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
              <LanguageSwitcher currentLocale={locale} />
              {authBlockStacked}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </header>
  );
}
