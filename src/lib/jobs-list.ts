/** Количество заявок на одной странице ленты. */
export const JOBS_PAGE_SIZE = 20;

export function parseJobsPage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) {
    return 1;
  }
  return n;
}

/** `sort=old` в URL → сначала старые; иначе — сначала новые. */
export function parseJobsSortOrder(sort: string | undefined): "asc" | "desc" {
  return sort === "old" ? "asc" : "desc";
}
