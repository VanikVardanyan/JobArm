import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/routes";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { EditResumeForm } from "@/features/manage-resumes/ui/edit-resume-form";
import { SectionLink } from "@/components/section-link";
import { ui } from "@/components/ui/styles";
import { pageMetadata } from "@/lib/seo";
import type { LocaleEntityPageProps } from "@/types/props";

export async function generateMetadata({ params }: LocaleEntityPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return pageMetadata({
    locale,
    pathname: "/dashboard/resumes",
    title: d.dashboard.editResumeTitle,
    description: d.dashboard.resumesTitle,
    noIndex: true,
  });
}

export default async function EditResumePage({ params }: LocaleEntityPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect(routes.authSignIn(locale));

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect(routes.authSignIn(locale));

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
  if (!resume || resume.authorId !== user.id) notFound();

  return (
    <main className="flex flex-col gap-6 pb-12">
      <SectionLink href={routes.dashboard(locale)} label={d.dashboard.resumesTitle} />
      <section className={ui.panel}>
        <h1 className="text-2xl font-semibold">{d.dashboard.editResumeTitle}</h1>
        <EditResumeForm resume={resume} locale={locale} resumeT={d.resume} dashT={d.dashboard} />
      </section>
    </main>
  );
}
