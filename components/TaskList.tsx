"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import TaskCard from "./TaskCard";
import { isMyTask } from "@/lib/tokens";

type Task = {
  id: string;
  description: string;
  budget: number | null;
  phone: string;
  createdAt: string;
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const t = useTranslations("home");
  const [myTasks, setMyTasks] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const mine = new Set(tasks.filter((t) => isMyTask(t.id)).map((t) => t.id));
    setMyTasks(mine);
  }, [tasks]);

  const filtered = search.trim()
    ? tasks.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t("noTasks")}</p>
        </div>
        <Link
          href="/create"
          className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-colors"
        >
          {t("createButtonShort")}
        </Link>
      </div>
    );
  }

  return (
    <section id="tasks">
      {/* Section header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("taskListTitle")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tasks.length} {t("activeTasks")}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center py-10 text-sm text-slate-400 dark:text-slate-500">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} isMine={myTasks.has(task.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
