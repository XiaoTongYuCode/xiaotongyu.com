import type { Metadata } from "next";
import WorkPageClient from "./WorkPageClient";

export const metadata: Metadata = {
  title: { absolute: "作品 | 肖彤宇（Xiaotong Yu）" },
  description:
    "肖彤宇（Xiaotong Yu）的精选作品：Mewa 主动智能与朋友社区、CornAgent、Myrisle 本地 AI 日记与 Petspace。",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "作品 | 肖彤宇（Xiaotong Yu）",
    description:
      "探索 Mewa、CornAgent、Myrisle 与 Petspace：围绕 AI、个人空间与朋友社区的产品实践。",
    type: "website",
    url: "/work",
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
