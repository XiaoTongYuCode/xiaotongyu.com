import type { MetadataRoute } from "next";

import { SITE_URL } from "./_seo/site";
import { SITE_PATHS, localizedPath } from "./_i18n/routing";

const LAST_UPDATED = new Date("2026-11-10T00:00:00+08:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_PATHS.flatMap((path) => {
    const languages = {
      "en-US": `${SITE_URL}${path}`,
      "zh-CN": `${SITE_URL}${localizedPath(path, "zh-CN")}`,
      "x-default": `${SITE_URL}${path}`,
    };
    return (["en-US", "zh-CN"] as const).map((locale) => ({
      url: `${SITE_URL}${localizedPath(path, locale)}`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path === "/work" ? 0.8 : 0.7,
      alternates: { languages },
    }));
  });
}
