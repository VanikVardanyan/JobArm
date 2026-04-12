export default function TasksLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col gap-3 animate-pulse"
        >
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-800 w-full" />
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-800 w-5/6" />
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-800 w-3/4" />
          <div className="flex justify-between pt-2">
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-800 w-16" />
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-800 w-20" />
          </div>
          <div className="h-9 rounded-xl bg-gray-200 dark:bg-gray-800 mt-2" />
        </div>
      ))}
    </div>
  );
}
