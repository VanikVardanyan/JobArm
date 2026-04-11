"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Hero({ count }: { count: number }) {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 px-6 py-10 sm:px-10 sm:py-14 text-white shadow-lg shadow-indigo-500/10">
      {/* decorative blobs */}
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-violet-400/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 sm:gap-6 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {t("heroTitle")}
        </h1>
        <p className="text-white/90 text-base sm:text-lg max-w-xl">
          {t("heroSubtitle")}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            <span className="text-base">＋</span>
            {t("createButtonShort")}
          </Link>
          <span className="text-sm text-white/80">
            · {count} {t("activeTasks")}
          </span>
        </div>
      </div>
    </section>
  );
}
