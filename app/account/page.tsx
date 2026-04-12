import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import ResumeList from "@/components/ResumeList";
import LogoutButton from "@/components/LogoutButton";
import GoogleLogoutButton from "@/components/GoogleLogoutButton";
import { getUserFromSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getGoogleUserFromToken, GOOGLE_SESSION_COOKIE } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const t = await getTranslations("account");
  const tResume = await getTranslations("resume");
  const cookieStore = await cookies();
  const user = await getUserFromSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const googleUser = await getGoogleUserFromToken(cookieStore.get(GOOGLE_SESSION_COOKIE)?.value);

  if (!user && !googleUser) {
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

  // Phone user tasks
  const tasks = user
    ? await prisma.task.findMany({
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
      })
    : [];

  const serializedTasks = tasks.map((task) => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    isMine: true,
  }));

  // Google user resumes
  const resumes = googleUser
    ? await prisma.resume.findMany({
        where: { googleUserId: googleUser.id, expiresAt: { gt: new Date() } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          description: true,
          category: true,
          phone: true,
          googleUserId: true,
          createdAt: true,
          googleUser: { select: { name: true, picture: true } },
        },
      })
    : [];

  const serializedResumes = resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    isMine: true,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Phone account section */}
      {user && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.phone}</p>
            </div>
            <LogoutButton label={t("logout")} />
          </div>
          <TaskList tasks={serializedTasks} showFilters={false} />
        </div>
      )}

      {/* Google account section */}
      {googleUser && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {googleUser.picture && (
                <img
                  src={googleUser.picture}
                  alt=""
                  className="w-10 h-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {tResume("listTitle")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {googleUser.name || googleUser.email}
                </p>
              </div>
            </div>
            <GoogleLogoutButton label={t("logout")} />
          </div>
          <ResumeList resumes={serializedResumes} showFilters={false} />
        </div>
      )}
    </div>
  );
}
