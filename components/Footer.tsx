"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">J</span>
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Jobarm
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>{t("copy")}</span>
        </div>
        <Link
          href="/privacy"
          className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
