"use client";

import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
  destructive,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
