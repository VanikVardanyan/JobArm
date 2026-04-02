/** Количество резюме на одной странице ленты. */
export const WORKERS_PAGE_SIZE = 20;

export function parseWorkersPage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) {
    return 1;
  }
  return n;
}

export function parseWorkersSortOrder(sort: string | undefined): "asc" | "desc" {
  return sort === "old" ? "asc" : "desc";
}
