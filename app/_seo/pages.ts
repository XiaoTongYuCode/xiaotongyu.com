import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOME_COPY } from "../_components/home/copy";
import { localizedPath, routeLocale } from "../_i18n/routing";
import type { Locale } from "../_i18n/types";
import { PERSON_ID, PERSON_NAME, SITE_URL } from "./site";

export type LocalizedPageProps = { params: Promise<{ locale: string }> };

export async function pageLocale({ params }: LocalizedPageProps): Promise<Locale> {
  const locale = routeLocale((await params).locale);
  if (!locale) notFound();
  return locale;
}

const PAGE_COPY = {
  "/about": {
    "en-US": {
      title: `About — ${PERSON_NAME}`,
      description: `I'm ${PERSON_NAME}, a software engineer in Beijing. A little about how I think, what I make, and the details I care about.`,
    },
    "zh-CN": {
      title: `关于 — ${PERSON_NAME}`,
      description: `我是 ${PERSON_NAME}，一名在北京工作的软件工程师。这里记录我的产品实践、AI 工作流，以及对界面与交互细节的探索。`,
    },
  },
  "/work": {
    "en-US": {
      title: `Work — ${PERSON_NAME}`,
      description: `Selected projects by ${PERSON_NAME}: Mewa, CornAgent, Myrisle, and Petspace. Experiments in AI, human connection, and everyday life.`,
    },
    "zh-CN": {
      title: `作品 — ${PERSON_NAME}`,
      description: `${PERSON_NAME} 的产品与实验：Mewa AI 伙伴、CornAgent 搜索与工具助手、Myrisle 本地 AI 日记，以及 Petspace 宠物社区。`,
    },
  },
} as const;

export function pageMetadata(path: "/" | "/about" | "/work", locale: Locale): Metadata {
  const { title, description } = path === "/" ? HOME_COPY[locale].meta : PAGE_COPY[path][locale];
  const canonical = localizedPath(path, locale);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        "en-US": path,
        "zh-CN": localizedPath(path, "zh-CN"),
        "x-default": path,
      },
    },
    openGraph: {
      title, description, url: canonical, type: "website",
      siteName: PERSON_NAME,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      alternateLocale: [locale === "zh-CN" ? "en_US" : "zh_CN"],
      images: [{ url: "/xiaotongyu-social.png", width: 1200, height: 630, alt: `${PERSON_NAME} — Products & code` }],
    },
    twitter: {
      card: "summary_large_image", title, description,
      creator: "@tongyu_xiao", images: ["/xiaotongyu-social.png"],
    },
  };
}

export function profilePageJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}${localizedPath("/about", locale)}#webpage`,
    url: `${SITE_URL}${localizedPath("/about", locale)}`,
    name: PAGE_COPY["/about"][locale].title,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": PERSON_ID },
  };
}
