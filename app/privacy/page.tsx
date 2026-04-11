"use client";

import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        {t("title")}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 text-base">{t("intro")}</p>

      <div className="flex flex-col gap-3">
        {(["collect", "why", "retention", "sharing", "delete"] as const).map((key) => (
          <div
            key={key}
            className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5 hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-colors"
          >
            <h2 className="font-semibold text-base mb-1.5 text-gray-900 dark:text-gray-100">
              {t(key)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {t(`${key}Text` as Parameters<typeof t>[0])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
