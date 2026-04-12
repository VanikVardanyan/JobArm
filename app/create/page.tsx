"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { saveToken } from "@/lib/tokens";
import { trackEvent } from "@/lib/analytics";

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
  const [category, setCategory] = useState("other");
  const [budget, setBudget] = useState("");
  const [phone, setPhone] = useState(PREFIX);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.phone) {
          setVerifiedPhone(data.user.phone);
          setPhone(formatPhone(data.user.phone));
        }
      })
      .catch(() => null);
  }, []);

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

  const ensurePhoneReady = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 11) {
      trackEvent("task_create_failed", { reason: "validation" });
      setError(t("phoneError"));
      return false;
    }
    return true;
  };

  const createDraft = async () => {
    setLoading(true);
    const res = await fetch("/api/task-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, category, budget }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      trackEvent("task_create_failed", { reason: "draft" });
      setError(t("error"));
      return null;
    }

    setDraftId(data.id);
    return data.id as string;
  };

  const publishDraft = async (id: string) => {
    setLoading(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: id }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === "limit_reached") {
        trackEvent("task_create_failed", { reason: "limit" });
        setError(t("limitError"));
      } else if (data.error === "unauthorized") {
        trackEvent("task_create_failed", { reason: "auth" });
        setError(t("codeError"));
      } else {
        trackEvent("task_create_failed", { reason: "server" });
        setError(t("error"));
      }
      return false;
    }

    trackEvent("task_created", {
      has_budget: Boolean(budget.trim() && Number(budget) > 0),
      category,
    });
    saveToken(data.id, data.manageToken);
    router.push("/tasks");
    return true;
  };

  const requestCode = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === "too_many_code_failures") {
        setError(t("codeLockError"));
      } else if (
        data.error === "daily_limit_reached" ||
        data.error === "phone_limit_reached" ||
        data.error === "ip_limit_reached"
      ) {
        setError(t("smsLimitError"));
      } else if (data.error === "cooldown") {
        setError(t("cooldownError"));
      } else {
        setError(t("error"));
      }
      return;
    }

    setCodeSent(true);
    setError(null);
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError(t("codeError"));
      return false;
    }

    setLoading(true);
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.user?.phone) {
      setError(data.error === "too_many_code_failures" ? t("codeLockError") : t("codeError"));
      return false;
    }

    setVerifiedPhone(data.user.phone);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let currentDraftId = draftId;
    if (!currentDraftId) {
      currentDraftId = await createDraft();
      if (!currentDraftId) return;
      if (verifiedPhone) await publishDraft(currentDraftId);
      else setAuthModalOpen(true);
      return;
    }

    if (!verifiedPhone) {
      setAuthModalOpen(true);
      return;
    }

    await publishDraft(currentDraftId);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!draftId) return;
    if (!ensurePhoneReady()) return;

    if (!codeSent) {
      await requestCode();
      return;
    }

    const ok = await verifyCode();
    if (ok) await publishDraft(draftId);
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
            disabled={Boolean(draftId)}
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
            {t("category")}
          </label>
          <select
            value={category}
            disabled={Boolean(draftId)}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-900 transition-colors"
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
            {t("budget")}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              disabled={Boolean(draftId)}
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
          {loading
            ? !draftId
              ? t("savingDraft")
              : t("submitting")
            : !draftId
              ? t("submit")
              : t("submit")}
        </button>
      </form>

      {authModalOpen && !verifiedPhone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("authTitle")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("authPrompt")}</p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => setAuthModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={t("close")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
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
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm tracking-wide transition-colors focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-900"
                />
              </div>

              {codeSent && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("code")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder={t("codePlaceholder")}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm tracking-wide transition-colors focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-900"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t("codeSent")}</p>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {loading
                  ? codeSent
                    ? t("verifying")
                    : t("sendingCode")
                  : codeSent
                    ? t("verifyAndPublish")
                    : t("sendCode")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
