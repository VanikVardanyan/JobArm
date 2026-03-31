import type { Metadata } from "next";
import { Manrope, Noto_Sans_Armenian } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { TawkChat } from "@/components/analytics/tawk-chat";
import { defaultLocale } from "@/i18n/config";
import { localeAlternates, siteDescription, siteName, siteUrl } from "@/lib/seo";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-armenian",
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  description: siteDescription,
  url: siteUrl.toString(),
  inLanguage: ["hy", "ru", "en", "fa", "hi"],
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: `${siteName} — быстрые задачи по всей Армении`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "jobArm",
    "Армения",
    "подработка",
    "разовые задачи",
    "заявки",
    "Ереван",
    "работа рядом",
  ],
  alternates: localeAlternates(),
  openGraph: {
    title: `${siteName} — быстрые задачи по всей Армении`,
    description: siteDescription,
    url: siteUrl.toString(),
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — быстрые задачи по всей Армении`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${manrope.variable} ${notoSansArmenian.variable}`}>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <TawkChat />
      </body>
    </html>
  );
}
