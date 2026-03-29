import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/routes";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { EditJobForm } from "@/features/manage-jobs/ui/edit-job-form";
import { SectionLink } from "@/components/section-link";
import { ui } from "@/components/ui/styles";
import type { LocalePageProps } from "@/types/props";

type Props = LocalePageProps & { params: Promise<{ locale: string; id: string }> };

export default async function EditJobPage({ params }: Props) {
  const { locale: rawLocale, id } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect(routes.authSignIn(locale));

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect(routes.authSignIn(locale));

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.authorId !== user.id) notFound();

  return (
    <main className="flex flex-col gap-6 pb-12">
      <SectionLink href={routes.dashboard(locale)} label={d.dashboard.title} />

      <section className={ui.panel}>
        <h1 className="text-2xl font-semibold">{d.dashboard.editTitle}</h1>
        <EditJobForm job={job} locale={locale} postT={d.post} dashT={d.dashboard} />
      </section>
    </main>
  );
}
