"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    trackEvent("logout");
    router.refresh();
    router.push("/");
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={logout}
      className="inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? `${label}...` : label}
    </button>
  );
}
