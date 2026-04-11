import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">404</h2>
      <p className="text-gray-500 dark:text-gray-400">Страница не найдена</p>
      <Link
        href="/"
        className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}
