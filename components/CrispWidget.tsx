"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export default function CrispWidget() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) return;
    if (document.getElementById("crisp-script")) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    const s = document.createElement("script");
    s.id = "crisp-script";
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  return null;
}
