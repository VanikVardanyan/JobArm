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
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("jobarm_theme") || "light";
    setIsDark(theme === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("jobarm_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight"
        >
          <span className="text-indigo-600 dark:text-indigo-400">Job</span>
          <span className="text-gray-900 dark:text-gray-100">arm</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/create"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span className="text-base leading-none">+</span>
            <span>{t("home.createButtonShort")}</span>
          </Link>

          <Link
            href="/create"
            aria-label={t("home.createButton")}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-sm shadow-indigo-500/20 transition-transform active:scale-90"
          >
            +
          </Link>

          <div className="hidden sm:flex items-center gap-1 text-xs font-medium pl-2 border-l border-gray-200 dark:border-gray-800">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setLocale(loc.code)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  locale === loc.code
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          {/* Mobile locale dropdown */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
            className="sm:hidden text-xs font-medium bg-transparent border border-gray-200 dark:border-gray-800 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300"
            aria-label="Language"
          >
            {LOCALES.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.label}
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
