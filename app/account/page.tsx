import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import LogoutButton from "@/components/LogoutButton";
import { getUserFromSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const t = await getTranslations("account");
  const cookieStore = await cookies();
  const user = await getUserFromSessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t("title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {t("loginHint")}
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-900"
        >
          {t("create")}
        </Link>
      </div>
    );
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      description: true,
      category: true,
      budget: true,
      phone: true,
      createdAt: true,
    },
  });

  const serialized = tasks.map((task) => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    isMine: true,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.phone}</p>
        </div>
        <LogoutButton label={t("logout")} />
      </div>
      <TaskList tasks={serialized} showFilters={false} />
    </div>
  );
}
