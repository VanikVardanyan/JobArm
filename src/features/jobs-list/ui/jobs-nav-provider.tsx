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
import { RouteSpinner } from "@/components/route-spinner";

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
      <div className="relative">
        {isPending ? (
          <div
            className="fixed inset-0 z-20 flex items-start justify-center bg-[color:var(--background)]/55 pt-[28vh] backdrop-blur-[3px]"
            aria-busy="true"
            aria-live="polite"
          >
            <RouteSpinner />
          </div>
        ) : null}
        {children}
      </div>
    </JobsNavContext.Provider>
  );
}
