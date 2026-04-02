import { notFound } from "next/navigation";
import { isLocale, isRtlLocale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { Header } from "@/widgets/header/ui/header";
import type { LocaleLayoutProps } from "@/types/props";

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = getLocale(rawLocale);
  const dictionary = getDictionary(locale);

  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <div className="app-shell min-h-screen px-4 py-4 sm:px-6" dir={dir} lang={locale}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Header
          locale={locale}
          productName={dictionary.common.productName}
          signInLabel={dictionary.common.signIn}
          signOutLabel={dictionary.common.signOut}
          browseTasksLabel={dictionary.common.browseTasks}
          browseWorkersLabel={dictionary.common.browseWorkers}
          dashboardLabel={dictionary.dashboard.cabinetLink}
          themeToggleLight={dictionary.common.themeToggleLight}
          themeToggleDark={dictionary.common.themeToggleDark}
          openMenuLabel={dictionary.common.openMenu}
          closeMenuLabel={dictionary.common.closeMenu}
        />
        {children}
      </div>
    </div>
  );
}
