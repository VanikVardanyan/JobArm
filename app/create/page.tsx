"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveToken } from "@/lib/tokens";
import Toast from "@/components/Toast";

const PREFIX = "+374 ";
const DESCRIPTION_MAX = 1000;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(3);
  let result = "";
  if (digits.length > 0) result += digits.slice(0, 2);
  if (digits.length > 2) result += " " + digits.slice(2, 5);
  if (digits.length > 5) result += " " + digits.slice(5, 8);
  return PREFIX + result;
}

export default function CreatePage() {
  const t = useTranslations("create");
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [phone, setPhone] = useState(PREFIX);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.startsWith(PREFIX.trimEnd())) {
      setPhone(PREFIX);
      return;
    }
    setPhone(formatPhone(raw));
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      input.selectionStart !== null &&
      input.selectionStart <= PREFIX.length
    ) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 11) {
      setError(t("phoneError"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, budget, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === "limit_reached") setError(t("limitError"));
      else setError(t("error"));
      return;
    }

    saveToken(data.id, data.manageToken);
    setToast(t("success"));
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
          {t("title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t("subtitle")}</p>
      </div>

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
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
          <div className="text-[11px] text-slate-400 dark:text-slate-500 self-end tabular-nums">
            {description.length}/{DESCRIPTION_MAX}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("budget")}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t("budgetPlaceholder")}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 text-base font-semibold pointer-events-none">
              &#1423;
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("phone")} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onFocus={(e) => {
              const len = e.target.value.length;
              setTimeout(() => e.target.setSelectionRange(len, len), 0);
            }}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors tracking-wide"
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
          className="w-full py-2.5 rounded-md bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>

      {toast && (
        <Toast
          message={toast}
          onDone={() => {
            setToast(null);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
