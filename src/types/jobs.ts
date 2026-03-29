import type { Locale } from "@/types/i18n";

export type ContactMethod = "phone" | "telegram" | "whatsapp";

export type JobCategory = "loaders" | "moving" | "loading" | "home-help" | "cleaning" | "repair" | "delivery" | "other";

export type Region =
  | "yerevan"
  | "aragatsotn"
  | "ararat"
  | "armavir"
  | "gegharkunik"
  | "kotayk"
  | "lori"
  | "shirak"
  | "syunik"
  | "tavush"
  | "vayots-dzor";

export type JobPreview = {
  id: string;
  title: Record<Locale, string>;
  category: JobCategory;
  price: string;
  region: Region;
  address: Record<Locale, string>;
  publishedAt: Record<Locale, string>;
  urgent: boolean;
};
