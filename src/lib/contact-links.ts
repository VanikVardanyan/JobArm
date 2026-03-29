import type { ContactMethod } from "@/types/jobs";

export function normalizeContactMethod(raw: string | null | undefined): ContactMethod {
  if (raw === "telegram" || raw === "whatsapp") {
    return raw;
  }
  return "phone";
}

/** Ссылка для связи: tel:, https://wa.me/… или https://t.me/+… по E.164. */
export function contactActionHref(method: ContactMethod, e164Phone: string): string {
  const digits = e164Phone.replace(/\D/g, "");
  if (method === "whatsapp") {
    return `https://wa.me/${digits}`;
  }
  if (method === "telegram") {
    return `https://t.me/+${digits}`;
  }
  return `tel:${e164Phone}`;
}
