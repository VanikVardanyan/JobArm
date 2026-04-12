declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

/** GA4 custom events — only when gtag is loaded (NEXT_PUBLIC_GA_MEASUREMENT_ID set at build). */
export function trackEvent(eventName: string, eventParams?: EventParams) {
  if (typeof window === "undefined") return;
  const { gtag } = window;
  if (typeof gtag !== "function") return;
  gtag("event", eventName, eventParams ?? {});
}
