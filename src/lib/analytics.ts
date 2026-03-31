"use client";

import { gaMeasurementId } from "@/lib/seo";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag || !gaMeasurementId) {
    return;
  }

  window.gtag("event", eventName, {
    ...params,
    send_to: gaMeasurementId,
  });
}

export function trackPageView(params: {
  page_title: string;
  page_location: string;
  page_path: string;
}) {
  if (typeof window === "undefined" || !window.gtag || !gaMeasurementId) {
    return;
  }

  window.gtag("event", "page_view", {
    ...params,
    send_to: gaMeasurementId,
  });
}
