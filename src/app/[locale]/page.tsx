import Link from "next/link";
import type { Metadata } from "next";
import { ui } from "@/components/ui/styles";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import type { LocalePageProps } from "@/types/props";

const statOrder = ["fastPublish", "guestAccess", "geography"] as const;

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return pageMetadata({
    locale,
    title: d.home.title,
    description: d.home.subtitle,
  });
}

export default async function HomePage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  const statsRow = statOrder.map((key, index) => ({
    key,
    label: d.home.stats[key],
    indexLabel: String(index + 1).padStart(2, "0"),
  }));

  return (
    <main className="flex flex-col gap-14 pb-16 sm:gap-16">
      <section className="home-hero px-6 py-14 text-center sm:px-10 sm:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
          <span className={ui.badgeAccent}>{d.home.badge}</span>

          <h1 className="text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-[3.35rem]">
            {d.home.title}
          </h1>

          <p className={`max-w-2xl text-base leading-8 sm:text-lg ${ui.textMuted}`}>{d.home.subtitle}</p>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link href={routes.post(locale)} className={ui.buttonPrimary} data-tour="home-publish">
              {d.home.publishCta}
            </Link>
            <Link
              href={routes.jobs(locale)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[color:var(--accent)] px-6 py-3.5 text-sm font-semibold leading-tight shadow-[0_14px_30px_rgba(242,107,29,0.16)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_36px_rgba(242,107,29,0.22)] sm:w-auto"
              style={{ backgroundColor: "#fff7ef", color: "#6f2500" }}
              data-tour="home-browse"
            >
              {d.home.browseCta}
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-stats-heading" className="px-1">
        <h2 id="home-stats-heading" className="sr-only">
          {d.home.badge}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {statsRow.map((stat) => (
            <div
              key={stat.key}
              className={`${ui.panelDense} flex flex-col gap-2 border-[color:var(--border)] text-center sm:text-left`}
            >
              <span className={`font-mono text-xs font-semibold tracking-widest ${ui.textMuted}`}>
                {stat.indexLabel}
              </span>
              <p className="text-sm font-semibold leading-snug text-[color:var(--foreground)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-it-works-title" className="flex flex-col gap-8 px-1">
        <h2 id="how-it-works-title" className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.home.howItWorks.title}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {d.home.howItWorks.steps.map((step, stepIndex) => {
            const stepNum = String(stepIndex + 1).padStart(2, "0");
            return (
              <div key={step.title} className={`${ui.panelDense} flex flex-col gap-3 border-[color:var(--border)]`}>
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] font-mono text-xs font-bold text-[color:var(--accent-strong)]`}
                >
                  {stepNum}
                </span>
                <h3 className="text-lg font-semibold leading-snug">{step.title}</h3>
                <p className={`text-sm leading-7 ${ui.textMuted}`}>{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
