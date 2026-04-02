"use client";

import { createContext, useContext, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

type WorkersNavContextValue = {
  isPending: boolean;
  navigate: (href: Route) => void;
};

const WorkersNavContext = createContext<WorkersNavContextValue | null>(null);

export function WorkersNavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const value = useMemo<WorkersNavContextValue>(
    () => ({
      isPending,
      navigate: (href) => {
        startTransition(() => {
          router.push(href);
        });
      },
    }),
    [isPending, router],
  );

  return <WorkersNavContext.Provider value={value}>{children}</WorkersNavContext.Provider>;
}

export function useWorkersNav() {
  const ctx = useContext(WorkersNavContext);
  if (!ctx) {
    throw new Error("useWorkersNav must be used inside WorkersNavProvider");
  }
  return ctx;
}

export function useOptionalWorkersNav() {
  return useContext(WorkersNavContext);
}
