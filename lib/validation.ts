export const DESCRIPTION_MAX = 1000;
export const BUDGET_MAX = 100_000_000;
export const MAX_ACTIVE_PER_PHONE = 3;
export const TASK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Normalize an Armenian phone number to canonical +374XXXXXXXX form.
 * Accepts inputs with spaces, dashes, parens, leading 0/374/+374.
 * Returns null if not a valid 8-digit Armenian number.
 */
export function normalizePhone(input: string): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");
  // Strip 374 country code if present
  if (digits.startsWith("374")) digits = digits.slice(3);
  // Strip leading 0 (local format)
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 8) return null;
  return `+374${digits}`;
}

export type TaskInputErrors = {
  description?: string;
  budget?: string;
  phone?: string;
};

export function validateTaskInput(raw: {
  description?: unknown;
  budget?: unknown;
  phone?: unknown;
}): { ok: true; data: { description: string; budget: number | null; phone: string } } | { ok: false; errors: TaskInputErrors } {
  const errors: TaskInputErrors = {};

  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (!description) errors.description = "required";
  else if (description.length > DESCRIPTION_MAX) errors.description = "too_long";

  let budget: number | null = null;
  if (raw.budget !== undefined && raw.budget !== null && raw.budget !== "") {
    const n = typeof raw.budget === "number" ? raw.budget : parseInt(String(raw.budget), 10);
    if (Number.isNaN(n) || n < 0) errors.budget = "invalid";
    else if (n > BUDGET_MAX) errors.budget = "too_big";
    else budget = n;
  }

  const normalized = typeof raw.phone === "string" ? normalizePhone(raw.phone) : null;
  if (!normalized) errors.phone = "invalid";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { description, budget, phone: normalized! } };
}
