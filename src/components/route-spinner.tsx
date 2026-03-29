import { cn } from "@/lib/cn";

type RouteSpinnerProps = {
  className?: string;
};

export function RouteSpinner({ className }: RouteSpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block h-10 w-10 shrink-0 animate-spin rounded-full border-2 border-[color:var(--border)] border-t-[color:var(--accent)]",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
