import type { Metadata } from "next";
import WorkPageClient from "./WorkPageClient";

export const metadata: Metadata = {
  title: { absolute: "作品 | 肖彤宇（Xiaotong Yu）" },
  description:
    "肖彤宇（Xiaotong Yu）的精选作品，涵盖本地 AI、社区产品、创意编程与浏览器体验。",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "作品 | 肖彤宇（Xiaotong Yu）",
    description:
      "肖彤宇（Xiaotong Yu）的精选作品：本地 AI、社区产品、创意编程与浏览器体验。",
    type: "website",
    url: "/work",
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
