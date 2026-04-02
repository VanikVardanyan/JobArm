import type { Metadata } from "next";
import { SectionLink } from "@/components/section-link";
import { ResumeForm } from "@/features/create-resume/ui/resume-form";
import { ui } from "@/components/ui/styles";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import type { LocalePageProps } from "@/types/props";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return pageMetadata({
    locale,
    pathname: "/workers/post",
    title: d.resume.title,
    description: d.resume.subtitle,
  });
}

export default async function WorkersPostPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return (
    <main className="flex flex-col gap-6 pb-12">
      <SectionLink href={routes.home(locale)} label={d.common.backToHome} />

      <section className={`${ui.panel} mx-auto w-full max-w-xl`}>
        <h1 className="text-xl font-semibold sm:text-2xl">{d.resume.title}</h1>
        <ResumeForm
          locale={locale}
          t={d.resume}
          commonT={{ loading: d.common.loading, browseWorkers: d.common.browseWorkers }}
          authT={d.auth}
        />
      </section>
    </main>
  );
}
