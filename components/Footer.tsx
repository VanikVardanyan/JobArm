"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-10">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Job</span>
          <span className="font-bold text-gray-700 dark:text-gray-200">arm</span>
          <span>·</span>
          <span>{t("copy")}</span>
        </div>
        <Link
          href="/privacy"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
