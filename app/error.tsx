"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Упс, что-то пошло не так
      </h2>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
      >
        Попробовать ещё раз
      </button>
    </div>
  );
}
