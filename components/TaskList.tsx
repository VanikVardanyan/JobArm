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

  useEffect(() => {
    const mine = new Set(tasks.filter((t) => isMyTask(t.id)).map((t) => t.id));
    setMyTasks(mine);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
        <div className="text-5xl">📋</div>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t("noTasks")}</p>
        <Link
          href="/create"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
        >
          ＋ {t("createButtonShort")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} isMine={myTasks.has(task.id)} />
      ))}
    </div>
  );
}
