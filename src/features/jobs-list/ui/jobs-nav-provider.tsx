"use client";

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

type JobsNavContextValue = {
  navigate: (href: Route) => void;
  isPending: boolean;
};

const JobsNavContext = createContext<JobsNavContextValue | null>(null);

export function useJobsNav(): JobsNavContextValue {
  const ctx = useContext(JobsNavContext);
  if (!ctx) {
    throw new Error("useJobsNav must be used within JobsNavProvider");
  }
  return ctx;
}

export function useOptionalJobsNav(): JobsNavContextValue | null {
  return useContext(JobsNavContext);
}

type JobsNavProviderProps = {
  children: ReactNode;
};

export function JobsNavProvider({ children }: JobsNavProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: Route) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  return (
    <JobsNavContext.Provider value={{ navigate, isPending }}>
      <div className="relative">{children}</div>
    </JobsNavContext.Provider>
  );
}
