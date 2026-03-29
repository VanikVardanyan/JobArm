import { normalizeContactMethod } from "./contact-links";
import { toE164AmPhone } from "./phone";
import type { ContactMethod, JobCategory, Region } from "../types/jobs";

const jobCategories = [
  "loaders",
  "moving",
  "loading",
  "home-help",
  "cleaning",
  "repair",
  "delivery",
  "other",
] as const satisfies readonly JobCategory[];

const jobRegions = [
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

const jobStatuses = ["active", "closed"] as const;
const priceTypes = ["fixed", "hourly"] as const;

const titleMinLength = 3;
const titleMaxLength = 120;
const addressMinLength = 5;
const addressMaxLength = 160;
const descriptionMaxLength = 2000;
const priceMaxLength = 60;

type ValidationSuccess<T> = { ok: true; data: T };
type ValidationFailure = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type ValidatedCreateJobInput = {
  title: string;
  description: string | null;
  category: JobCategory;
  price: string | null;
  priceType: "fixed" | "hourly";
  region: Region;
  address: string;
  isUrgent: boolean;
  date: string | null;
  time: string | null;
  contactPhone: string;
  contactMethod: ContactMethod;
};

export type ValidatedUpdateJobInput = Partial<
  ValidatedCreateJobInput & {
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

function parseOptionalText(
  value: unknown,
  maxLength: number,
): ValidationResult<string | null> {
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

function parseOptionalDate(value: unknown): ValidationResult<string | null> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, data: null };
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: "Invalid date" };
  }

  return { ok: true, data: value };
}

function parseOptionalTime(value: unknown): ValidationResult<string | null> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, data: null };
  }

  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return { ok: false, error: "Invalid time" };
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

function parseOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function assignIfPresent<T extends Record<string, unknown>, K extends keyof T>(
  target: Partial<T>,
  key: K,
  value: T[K] | undefined,
) {
  if (value !== undefined) {
    target[key] = value;
  }
}

export function validateCreateJobInput(body: unknown): ValidationResult<ValidatedCreateJobInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const title = parseRequiredText(body.title, titleMinLength, titleMaxLength, "Title");
  if (!title.ok) return title;

  const category = parseEnumValue(body.category, jobCategories, "category");
  if (!category.ok) return category;

  const region = parseEnumValue(body.region, jobRegions, "region");
  if (!region.ok) return region;

  const address = parseRequiredText(body.address, addressMinLength, addressMaxLength, "Address");
  if (!address.ok) return address;

  const contactPhone = parseRequiredPhone(body.contactPhone);
  if (!contactPhone.ok) return contactPhone;

  const description = parseOptionalText(body.description, descriptionMaxLength);
  if (!description.ok) return description;

  const price = parseOptionalText(body.price, priceMaxLength);
  if (!price.ok) return price;

  const priceType = body.priceType === undefined
    ? { ok: true as const, data: "fixed" as const }
    : parseEnumValue(body.priceType, priceTypes, "price type");
  if (!priceType.ok) return priceType;

  const date = parseOptionalDate(body.date);
  if (!date.ok) return date;

  const time = parseOptionalTime(body.time);
  if (!time.ok) return time;

  return {
    ok: true,
    data: {
      title: title.data,
      description: description.data,
      category: category.data,
      price: price.data,
      priceType: priceType.data,
      region: region.data,
      address: address.data,
      isUrgent: parseOptionalBoolean(body.isUrgent) ?? false,
      date: date.data,
      time: time.data,
      contactPhone: contactPhone.data,
      contactMethod: normalizeContactMethod(
        typeof body.contactMethod === "string" ? body.contactMethod : undefined,
      ),
    },
  };
}

export function validateUpdateJobInput(body: unknown): ValidationResult<ValidatedUpdateJobInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const data: ValidatedUpdateJobInput = {};

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
    const category = parseEnumValue(body.category, jobCategories, "category");
    if (!category.ok) return category;
    data.category = category.data;
  }

  if (body.price !== undefined) {
    const price = parseOptionalText(body.price, priceMaxLength);
    if (!price.ok) return price;
    data.price = price.data;
  }

  if (body.priceType !== undefined) {
    const priceType = parseEnumValue(body.priceType, priceTypes, "price type");
    if (!priceType.ok) return priceType;
    data.priceType = priceType.data;
  }

  if (body.region !== undefined) {
    const region = parseEnumValue(body.region, jobRegions, "region");
    if (!region.ok) return region;
    data.region = region.data;
  }

  if (body.address !== undefined) {
    const address = parseRequiredText(body.address, addressMinLength, addressMaxLength, "Address");
    if (!address.ok) return address;
    data.address = address.data;
  }

  assignIfPresent(data, "isUrgent", parseOptionalBoolean(body.isUrgent));

  if (body.date !== undefined) {
    const date = parseOptionalDate(body.date);
    if (!date.ok) return date;
    data.date = date.data;
  }

  if (body.time !== undefined) {
    const time = parseOptionalTime(body.time);
    if (!time.ok) return time;
    data.time = time.data;
  }

  if (body.status !== undefined) {
    const status = parseEnumValue(body.status, jobStatuses, "status");
    if (!status.ok) return status;
    data.status = status.data;
  }

  if (body.contactPhone !== undefined) {
    const contactPhone = parseRequiredPhone(body.contactPhone);
    if (!contactPhone.ok) return contactPhone;
    data.contactPhone = contactPhone.data;
  }

  if (body.contactMethod !== undefined) {
    if (typeof body.contactMethod !== "string") {
      return { ok: false, error: "Invalid contact method" };
    }
    data.contactMethod = normalizeContactMethod(body.contactMethod);
  }

  return { ok: true, data };
}
