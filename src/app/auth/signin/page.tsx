import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";
import { routes } from "@/lib/routes";

function resolveLocaleFromReferer(referer: string | null) {
  if (!referer) {
    return defaultLocale;
  }

  try {
    const { pathname } = new URL(referer);
    const maybeLocale = pathname.split("/")[1];
    return isLocale(maybeLocale) ? maybeLocale : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export default async function NeutralSignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = (await searchParams)?.callbackUrl;
  const locale = resolveLocaleFromReferer((await headers()).get("referer"));
  const destination = new URL(routes.authSignIn(locale), "http://localhost");

  if (callbackUrl) {
    destination.searchParams.set("callbackUrl", callbackUrl);
  }

  redirect(`${destination.pathname}${destination.search}` as Parameters<typeof redirect>[0]);
}
