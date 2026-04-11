import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "ru";
  const validLocales = ["hy", "ru", "en"];
  const finalLocale = validLocales.includes(locale) ? locale : "ru";

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default,
  };
});
