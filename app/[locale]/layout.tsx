import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import StyledJsxRegistry from "../styled-jsx-registry";
import { HOME_COPY } from "../_components/home/copy";
import { LocaleProvider } from "../_i18n/LocaleProvider";
import { LEGACY_LOCALE_SCRIPT } from "../_i18n/routing";
import { pageLocale, type LocalizedPageProps } from "../_seo/pages";
import {
  PERSON_ID,
  PERSON_NAME,
  PERSON_NAME_ZH,
  SITE_URL,
  personJsonLd,
  serializeJsonLd,
} from "../_seo/site";

const { title, description } = HOME_COPY["en-US"].meta;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${PERSON_NAME}`,
  },
  description,
  keywords: [
    PERSON_NAME_ZH,
    PERSON_NAME,
    "软件工程师",
    "产品工程",
    "AI 应用",
    "创意编程",
  ],
  authors: [{ name: PERSON_NAME, url: "/" }],
  creator: PERSON_NAME,
  publisher: PERSON_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/xtyopen-icon.svg", type: "image/svg+xml" }],
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
  openGraph: {
    title,
    description,
    siteName: PERSON_NAME,
    type: "website",
    url: "/",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    images: [
      {
        url: "/xiaotongyu-social.png",
        width: 1200,
        height: 630,
        alt: `${PERSON_NAME} 个人网站`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/xiaotongyu-social.png"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: PERSON_NAME,
      alternateName: PERSON_NAME_ZH,
      description,
      inLanguage: ["zh-CN", "en-US"],
      publisher: { "@id": PERSON_ID },
    },
    personJsonLd,
  ],
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<LocalizedPageProps & {
  children: React.ReactNode;
}>) {
  const locale = await pageLocale({ params });
  return (
    <html lang={locale === "zh-CN" ? "zh-CN" : "en"}>
      <head>
        <script id="legacy-locale" dangerouslySetInnerHTML={{ __html: LEGACY_LOCALE_SCRIPT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
        <LocaleProvider locale={locale}>
          <StyledJsxRegistry>{children}</StyledJsxRegistry>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
