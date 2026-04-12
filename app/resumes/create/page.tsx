"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const DESCRIPTION_MAX = 1000;

type GoogleUser = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

export default function CreateResumePage() {
  const t = useTranslations("resume");
  const router = useRouter();
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/google/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setGoogleUser(data.user);
      })
      .catch(() => null)
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!googleUser) return;

    setLoading(true);
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, category, phone: phone || null }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === "limit_reached") {
        setError(t("limitError"));
      } else if (data.error === "unauthorized") {
        setError(t("loginRequired"));
      } else {
        setError(t("error"));
      }
      return;
    }

    trackEvent("resume_created", { category });
    router.push("/resumes");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/google/logout", { method: "POST" });
    setGoogleUser(null);
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-8 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t("back")}
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
          {t("createTitle")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t("createSubtitle")}</p>
      </div>

      {/* Google auth section */}
      {checkingAuth ? (
        <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : !googleUser ? (
        <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("loginRequired")}</p>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("loginWithGoogle")}
          </a>
        </div>
      ) : (
        <>
          {/* Logged in user info */}
          <div className="mb-5 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {googleUser.picture && (
                <img
                  src={googleUser.picture}
                  alt=""
                  className="w-8 h-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {googleUser.name || googleUser.email}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{googleUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {t("logout")}
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("description")} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                maxLength={DESCRIPTION_MAX}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
              <div className="text-[11px] text-slate-400 dark:text-slate-500 self-end tabular-nums">
                {description.length}/{DESCRIPTION_MAX}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("category")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors"
              >
                <option value="loader">{t("categoryLoader")}</option>
                <option value="restaurant_food">{t("categoryRestaurantFood")}</option>
                <option value="services">{t("categoryServices")}</option>
                <option value="craft">{t("categoryCraft")}</option>
                <option value="other">{t("categoryOther")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phonePlaceholder")}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("submitting") : t("submit")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
