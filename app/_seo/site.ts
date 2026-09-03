export const SITE_URL = "https://www.xiaotongyu.com";
export const PERSON_URL = `${SITE_URL}/`;
export const PERSON_ID = `${SITE_URL}/#person`;

export const PERSON_NAME_ZH = "肖彤宇";
export const PERSON_NAME_EN = "Xiaotong Yu";
export const PERSON_HANDLE = "XiaoTongYu";

export const PERSON_SAME_AS = [
  "https://github.com/XiaoTongYuCode",
  "https://x.com/tongyu_xiao",
] as const;

export const PERSON_DESCRIPTION =
  "肖彤宇（Xiaotong Yu）是常驻北京的软件工程师，专注于产品工程、AI 应用、创意编程与网页体验。";

export const personJsonLd = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON_NAME_ZH,
  alternateName: [PERSON_NAME_EN, PERSON_HANDLE, "小童"],
  url: PERSON_URL,
  email: "mailto:work@xiaotongyu.com",
  jobTitle: "Software Engineer",
  description: PERSON_DESCRIPTION,
  homeLocation: {
    "@type": "City",
    name: "北京",
    alternateName: "Beijing",
  },
  knowsAbout: [
    "Product Engineering",
    "AI Applications",
    "Creative Coding",
    "Web Development",
    "Human-Computer Interaction",
  ],
  sameAs: PERSON_SAME_AS,
};

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
