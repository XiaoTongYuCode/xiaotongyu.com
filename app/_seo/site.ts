import { DISPLAY_NAME, GITHUB_URL, X_URL } from "../_components/site/identity";

export const SITE_URL = "https://www.xiaotongyu.com";
export const PERSON_URL = `${SITE_URL}/`;
export const PERSON_ID = `${SITE_URL}/#person`;

export const PERSON_NAME_ZH = "肖彤宇";
export const PERSON_NAME = DISPLAY_NAME;

export const PERSON_SAME_AS = [
  GITHUB_URL,
  X_URL,
] as const;

export const PERSON_DESCRIPTION =
  `${PERSON_NAME} 是常驻北京的软件工程师，专注于产品工程、AI 应用、创意编程与网页体验。`;

export const personJsonLd = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON_NAME,
  alternateName: [PERSON_NAME_ZH],
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
