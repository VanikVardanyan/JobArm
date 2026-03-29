import type { Metadata } from "next";
import { SectionLink } from "@/components/section-link";
import { PostForm } from "@/features/create-job/ui/post-form";
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
    pathname: "/post",
    title: d.post.title,
    description: d.post.subtitle,
  });
}

export default async function PostPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return (
    <main className="flex flex-col gap-6 pb-12">
      <SectionLink href={routes.home(locale)} label={d.common.backToHome} />

      <section className={`${ui.panel} mx-auto w-full max-w-xl`}>
        <h1 className="text-xl font-semibold sm:text-2xl">{d.post.title}</h1>
        <PostForm
          locale={locale}
          t={d.post}
          commonT={{ loading: d.common.loading, backToJobs: d.common.backToJobs }}
          authT={d.auth}
        />
      </section>
    </main>
  );
}
