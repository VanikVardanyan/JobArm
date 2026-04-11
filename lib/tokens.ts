import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "jobarm_tokens";

export function generateToken(): string {
  return uuidv4();
}

export function saveToken(taskId: string, token: string): void {
  if (typeof window === "undefined") return;
  const existing = getTokens();
  existing[taskId] = token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getTokens(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getToken(taskId: string): string | null {
  return getTokens()[taskId] ?? null;
}

export function removeToken(taskId: string): void {
  if (typeof window === "undefined") return;
  const existing = getTokens();
  delete existing[taskId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function isMyTask(taskId: string): boolean {
  return !!getToken(taskId);
}
