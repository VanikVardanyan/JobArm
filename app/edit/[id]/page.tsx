"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/tokens";
import { trackEvent } from "@/lib/analytics";
import Toast from "@/components/Toast";

const DESCRIPTION_MAX = 1000;

export default function EditPage() {
  const tEdit = useTranslations("edit");
  const tCreate = useTranslations("create");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const trackedEditView = useRef(false);

  useEffect(() => {
    const token = getToken(id);

    fetch(`/api/tasks/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        if (!token && !data.canEdit) {
          setFatalError(tEdit("unauthorized"));
          setFetchLoading(false);
          return;
        }
        setDescription(data.description);
        setCategory(data.category ?? "other");
        setBudget(data.budget?.toString() ?? "");
        setFetchLoading(false);
        if (!trackedEditView.current) {
          trackedEditView.current = true;
          trackEvent("task_edit_view");
        }
      })
      .catch(() => {
        setFatalError(tEdit("notFound"));
        setFetchLoading(false);
      });
  }, [id, tEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getToken(id);

    setLoading(true);
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, category, budget, manageToken: token }),
    });
    setLoading(false);

    if (!res.ok) {
      trackEvent("task_update_failed");
      setError(tEdit("error"));
      return;
    }

    trackEvent("task_updated", {
      has_budget: Boolean(budget.trim() && Number(budget) > 0),
    });
    setToast(tEdit("success"));
  };

  if (fetchLoading) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 flex flex-col items-center gap-4">
        <div className="text-5xl">🔒</div>
        <p className="text-red-500 dark:text-red-400">{fatalError}</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
        >
          {tCreate("back")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {tCreate("back")}
      </button>

      <h1 className="text-3xl font-extrabold tracking-tight mb-8">{tEdit("title")}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {tCreate("description")} <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="text-[11px] text-gray-400 dark:text-gray-600 self-end">
            {description.length} / {DESCRIPTION_MAX}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {tCreate("budget")}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 text-lg font-semibold pointer-events-none">
              ֏
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {tCreate("category")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="loader">{tCreate("categoryLoader")}</option>
            <option value="restaurant_food">{tCreate("categoryRestaurantFood")}</option>
            <option value="services">{tCreate("categoryServices")}</option>
            <option value="craft">{tCreate("categoryCraft")}</option>
            <option value="other">{tCreate("categoryOther")}</option>
          </select>
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
          {loading ? tEdit("submitting") : tEdit("submit")}
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
