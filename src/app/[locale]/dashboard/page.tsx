import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/routes";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { MyJobsList } from "@/features/manage-jobs/ui/my-jobs-list";
import { MyResumesList } from "@/features/manage-resumes/ui/my-resumes-list";
import { ui } from "@/components/ui/styles";
import { pageMetadata } from "@/lib/seo";
import type { LocalePageProps } from "@/types/props";

export const revalidate = 0;

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return pageMetadata({
    locale,
    pathname: "/dashboard",
    title: d.dashboard.title,
    description: d.dashboard.empty,
    noIndex: true,
  });
}

export default async function DashboardPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(routes.authSignIn(locale));
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect(routes.authSignIn(locale));

  const jobs = await prisma.job.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const resumes = await prisma.resume.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex flex-col gap-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{d.dashboard.title}</h1>
        <Link href={routes.post(locale)} className={ui.buttonDashboardPrimary} data-tour="dashboard-add">
          {d.dashboard.addJob}
        </Link>
      </div>

      <div data-tour="dashboard-list">
        <MyJobsList jobs={jobs} locale={locale} t={d.dashboard} urgentLabel={d.common.urgent} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{d.dashboard.resumesTitle}</h2>
        <Link href={routes.workersPost(locale)} className={ui.buttonDashboardPrimary}>
          {d.dashboard.addResume}
        </Link>
      </div>

      <div>
        <MyResumesList resumes={resumes} locale={locale} t={d.dashboard} />
      </div>
    </main>
  );
}
