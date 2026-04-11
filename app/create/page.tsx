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
    <div className="max-w-xl mx-auto py-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t("back")}
      </button>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t("title")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t("description")} <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
          <div className="text-[11px] text-gray-400 dark:text-gray-600 self-end">
            {description.length} / {DESCRIPTION_MAX}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t("budget")}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t("budgetPlaceholder")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 text-lg font-semibold pointer-events-none">
              ֏
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
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
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-wide"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>

      {toast && (
        <Toast
          message={"✅ " + toast}
          onDone={() => {
            setToast(null);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
