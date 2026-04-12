"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";

const LOCALES = [
  { code: "hy" as const, label: "ՀԱՅ" },
  { code: "ru" as const, label: "РУС" },
  { code: "en" as const, label: "ENG" },
];

export default function Header() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const [themeState, setThemeState] = useState({ isDark: false, mounted: false });

  useEffect(() => {
    const theme = localStorage.getItem("jobarm_theme") || "light";
    setThemeState({ isDark: theme === "dark", mounted: true });
  }, []);

  const { isDark, mounted } = themeState;

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setThemeState({ isDark: !isDark, mounted: true });
    localStorage.setItem("jobarm_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
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

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Language switcher - desktop */}
          <div className="hidden sm:flex items-center gap-0.5 mr-1">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setLocale(loc.code)}
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

          {/* Language switcher - mobile */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
            className="sm:hidden text-xs font-medium bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-slate-600 dark:text-slate-300"
            aria-label="Language"
          >
            {LOCALES.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.label}
              </option>
            ))}
          </select>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            className="ml-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">{t("home.createButtonShort")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
