"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function RouteTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (!gaId || typeof window.gtag !== "function") return;
    const q = searchParams.toString();
    const pagePath = q ? `${pathname}?${q}` : pathname;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    window.gtag("config", gaId, { page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

export default function GaRouteTracker() {
  if (!gaId) return null;
  return (
    <Suspense fallback={null}>
      <RouteTrackerInner />
    </Suspense>
  );
}
