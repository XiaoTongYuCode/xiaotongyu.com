import type { MetadataRoute } from "next";

import { SITE_URL } from "./_seo/site";

const LAST_UPDATED = new Date("2026-08-25T00:00:00+08:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/game/1`,
      lastModified: LAST_UPDATED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
