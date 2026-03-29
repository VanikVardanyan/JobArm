import Link from "next/link";
import type { Metadata } from "next";
import { SignInButton } from "@/features/auth/ui/sign-in-button";
import { routes } from "@/lib/routes";
import { ui } from "@/components/ui/styles";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import type { LocalePageProps } from "@/types/props";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return pageMetadata({
    locale,
    pathname: "/auth/signin",
    title: d.auth.title,
    description: d.auth.subtitle,
    noIndex: true,
  });
}

export default async function SignInPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className={`${ui.panel} flex flex-col items-center gap-6 text-center`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--accent-soft)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--accent-strong)]">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold">{d.auth.title}</h1>
            <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{d.auth.subtitle}</p>
          </div>

          <SignInButton
            label={d.auth.button}
            callbackUrl={routes.dashboard(locale)}
            className={`inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-[color:var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]`}
          />

          <Link
            href={routes.jobs(locale)}
            className={`text-sm ${ui.textMuted} underline underline-offset-4`}
          >
            {d.auth.guestHint}
          </Link>
        </div>
      </div>
    </main>
  );
}
