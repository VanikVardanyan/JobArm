/** Значения из query `?category=a,b&region=x,y`. */
export function parseCommaListParam(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
