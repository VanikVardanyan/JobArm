"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { useLocale } from "./LocaleProvider";

const LOCALES = [
  { code: "hy" as const, label: "ՀԱՅ" },
  { code: "ru" as const, label: "РУС" },
  { code: "en" as const, label: "ENG" },
];

export default function Header() {
  const t = useTranslations();
  const tResume = useTranslations("resume");
  const { locale, setLocale } = useLocale();
  const [themeState, setThemeState] = useState({ isDark: false, mounted: false });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("jobarm_theme") || "light";
    const timer = window.setTimeout(() => {
      setThemeState({ isDark: theme === "dark", mounted: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const { isDark, mounted } = themeState;

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setThemeState({ isDark: !isDark, mounted: true });
    localStorage.setItem("jobarm_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    trackEvent("theme_toggle", { theme: next });
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-lg">
      <div className="container mx-auto px-4 max-w-6xl h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Jobarm
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 mr-1">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  trackEvent("locale_change", { locale: loc.code });
                  setLocale(loc.code);
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  locale === loc.code
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          {/* Resumes link */}
          <Link
            href={"/resumes" as const}
            onClick={() => trackEvent("cta_click", { location: "header", target: "resumes" })}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
          >
            {tResume("navLink")}
          </Link>

          {/* Account */}
          <Link
            href="/account"
            onClick={() => trackEvent("cta_click", { location: "header", target: "account" })}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t("header.account")}
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 sm:border-transparent text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* CTA */}
          <Link
            href="/create"
            onClick={() =>
              trackEvent("cta_click", { location: "header", target: "create" })
            }
            className="ml-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("home.createButtonShort")}
          </Link>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/create"
            onClick={() =>
              trackEvent("cta_click", { location: "header", target: "create" })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

    </header>

    {/* Mobile sidebar — outside header to avoid backdrop-blur stacking context */}
    {menuOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <nav
            className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-[#0f0f17] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-1 p-4">
              <Link
                href="/create"
                onClick={() => { setMenuOpen(false); trackEvent("cta_click", { location: "mobile_menu", target: "create" }); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t("home.createButtonShort")}
              </Link>
              <Link
                href="/tasks"
                onClick={() => { setMenuOpen(false); trackEvent("cta_click", { location: "mobile_menu", target: "tasks" }); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                {t("home.browseTasks")}
              </Link>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

              <Link
                href={"/resumes/create" as const}
                onClick={() => { setMenuOpen(false); trackEvent("cta_click", { location: "mobile_menu", target: "create_resume" }); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {tResume("createButton")}
              </Link>
              <Link
                href={"/resumes" as const}
                onClick={() => { setMenuOpen(false); trackEvent("cta_click", { location: "mobile_menu", target: "resumes" }); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                {tResume("browseResumes")}
              </Link>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

              <Link
                href="/account"
                onClick={() => { setMenuOpen(false); trackEvent("cta_click", { location: "mobile_menu", target: "account" }); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {t("header.account")}
              </Link>
            </div>

            {/* Bottom: language */}
            <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="flex items-center gap-1">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => {
                      trackEvent("locale_change", { locale: loc.code });
                      setLocale(loc.code);
                    }}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                      locale === loc.code
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
