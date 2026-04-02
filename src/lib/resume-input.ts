import { normalizeContactMethod } from "./contact-links";
import { toE164AmPhone } from "./phone";
import type { ContactMethod, JobCategory, Region } from "@/types/jobs";

const resumeCategories = [
  "loaders",
  "moving",
  "loading",
  "home-help",
  "cleaning",
  "repair",
  "delivery",
  "other",
] as const satisfies readonly JobCategory[];

const resumeRegions = [
  "yerevan",
  "aragatsotn",
  "ararat",
  "armavir",
  "gegharkunik",
  "kotayk",
  "lori",
  "shirak",
  "syunik",
  "tavush",
  "vayots-dzor",
] as const satisfies readonly Region[];

const resumeStatuses = ["active", "closed"] as const;
const titleMinLength = 3;
const titleMaxLength = 120;
const descriptionMaxLength = 2000;
const priceMaxLength = 60;
const publicContactNameMaxLength = 80;

type ValidationSuccess<T> = { ok: true; data: T };
type ValidationFailure = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type ValidatedCreateResumeInput = {
  title: string;
  description: string | null;
  category: JobCategory;
  price: string | null;
  region: Region;
  contactPhone: string;
  contactMethod: ContactMethod;
  publicContactName: string | null;
};

export type ValidatedUpdateResumeInput = Partial<
  ValidatedCreateResumeInput & {
    status: "active" | "closed";
  }
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
}

function parseOptionalText(value: unknown, maxLength: number): ValidationResult<string | null> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, data: null };
  }

  const text = cleanText(value);
  if (!text) {
    return { ok: true, data: null };
  }

  if (text.length > maxLength) {
    return { ok: false, error: `Field is too long (max ${maxLength})` };
  }

  return { ok: true, data: text };
}

function parseRequiredText(
  value: unknown,
  minLength: number,
  maxLength: number,
  fieldName: string,
): ValidationResult<string> {
  const text = cleanText(value);
  if (!text) {
    return { ok: false, error: `${fieldName} is required` };
  }
  if (text.length < minLength) {
    return { ok: false, error: `${fieldName} is too short` };
  }
  if (text.length > maxLength) {
    return { ok: false, error: `${fieldName} is too long` };
  }
  return { ok: true, data: text };
}

function parseEnumValue<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fieldName: string,
): ValidationResult<T[number]> {
  if (typeof value !== "string" || !allowed.includes(value)) {
    return { ok: false, error: `Invalid ${fieldName}` };
  }
  return { ok: true, data: value };
}

function parseRequiredPhone(value: unknown): ValidationResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: "Contact phone is required" };
  }

  const phone = toE164AmPhone(value);
  if (!phone) {
    return { ok: false, error: "Invalid contact phone" };
  }

  return { ok: true, data: phone };
}

export function validateCreateResumeInput(body: unknown): ValidationResult<ValidatedCreateResumeInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const title = parseRequiredText(body.title, titleMinLength, titleMaxLength, "Title");
  if (!title.ok) return title;

  const category = parseEnumValue(body.category, resumeCategories, "category");
  if (!category.ok) return category;

  const region = parseEnumValue(body.region, resumeRegions, "region");
  if (!region.ok) return region;

  const contactPhone = parseRequiredPhone(body.contactPhone);
  if (!contactPhone.ok) return contactPhone;

  const description = parseOptionalText(body.description, descriptionMaxLength);
  if (!description.ok) return description;

  const price = parseOptionalText(body.price, priceMaxLength);
  if (!price.ok) return price;

  const publicContactName = parseOptionalText(body.publicContactName, publicContactNameMaxLength);
  if (!publicContactName.ok) return publicContactName;

  return {
    ok: true,
    data: {
      title: title.data,
      description: description.data,
      category: category.data,
      price: price.data,
      region: region.data,
      contactPhone: contactPhone.data,
      contactMethod: normalizeContactMethod(
        typeof body.contactMethod === "string" ? body.contactMethod : undefined,
      ),
      publicContactName: publicContactName.data,
    },
  };
}

export function validateUpdateResumeInput(body: unknown): ValidationResult<ValidatedUpdateResumeInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const data: ValidatedUpdateResumeInput = {};

  if (body.title !== undefined) {
    const title = parseRequiredText(body.title, titleMinLength, titleMaxLength, "Title");
    if (!title.ok) return title;
    data.title = title.data;
  }

  if (body.description !== undefined) {
    const description = parseOptionalText(body.description, descriptionMaxLength);
    if (!description.ok) return description;
    data.description = description.data;
  }

  if (body.category !== undefined) {
    const category = parseEnumValue(body.category, resumeCategories, "category");
    if (!category.ok) return category;
    data.category = category.data;
  }

  if (body.price !== undefined) {
    const price = parseOptionalText(body.price, priceMaxLength);
    if (!price.ok) return price;
    data.price = price.data;
  }

  if (body.region !== undefined) {
    const region = parseEnumValue(body.region, resumeRegions, "region");
    if (!region.ok) return region;
    data.region = region.data;
  }

  if (body.contactPhone !== undefined) {
    const contactPhone = parseRequiredPhone(body.contactPhone);
    if (!contactPhone.ok) return contactPhone;
    data.contactPhone = contactPhone.data;
  }

  if (body.contactMethod !== undefined) {
    data.contactMethod = normalizeContactMethod(
      typeof body.contactMethod === "string" ? body.contactMethod : undefined,
    );
  }

  if (body.publicContactName !== undefined) {
    const publicContactName = parseOptionalText(body.publicContactName, publicContactNameMaxLength);
    if (!publicContactName.ok) return publicContactName;
    data.publicContactName = publicContactName.data;
  }

  if (body.status !== undefined) {
    const status = parseEnumValue(body.status, resumeStatuses, "status");
    if (!status.ok) return status;
    data.status = status.data;
  }

  return { ok: true, data };
}
