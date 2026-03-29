import { RouteSpinner } from "@/components/route-spinner";

export default function LocaleSegmentLoading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-20">
      <RouteSpinner />
    </div>
  );
}
