"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useState, useCallback } from "react";

type Messages = Record<string, unknown>;
type Locale = "hy" | "ru" | "en";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "ru", setLocale: () => {} });

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({
  initialLocale,
  allMessages,
  children,
}: {
  initialLocale: Locale;
  allMessages: Record<Locale, Messages>;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `locale=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
