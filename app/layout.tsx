import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { getLocale } from "next-intl/server";
import LocaleProvider from "@/components/LocaleProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import CrispWidget from "@/components/CrispWidget";

import hyMessages from "@/messages/hy.json";
import ruMessages from "@/messages/ru.json";
import enMessages from "@/messages/en.json";

const geist = Geist({ subsets: ["latin"] });

type Locale = "hy" | "ru" | "en";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jobarm.am";

const META: Record<Locale, { title: string; description: string }> = {
  hy: {
    title: "Jobarm — արագ առաջադրանքներ Հայաստանում",
    description: "Հայտարարությունների տախտակ մեկանգամյա առաջադրանքների համար",
  },
  ru: {
    title: "Jobarm — быстрые задачи в Армении",
    description: "Доска объявлений для быстрых разовых задач в Армении",
  },
  en: {
    title: "Jobarm — quick gigs in Armenia",
    description: "A simple board for one-off tasks in Armenia",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const m = META[locale] ?? META.ru;
  return {
    metadataBase: new URL(SITE_URL),
    title: m.title,
    description: m.description,
    openGraph: {
      title: m.title,
      description: m.description,
      type: "website",
      url: SITE_URL,
      siteName: "Jobarm",
      locale,
    },
  };
}

const allMessages = { hy: hyMessages, ru: ruMessages, en: enMessages };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jobarm_theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geist.className} min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <LocaleProvider initialLocale={locale} allMessages={allMessages}>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
            {children}
          </main>
          <Footer />
        </LocaleProvider>
        <Analytics />
        <CrispWidget />
      </body>
    </html>
  );
}
