import type { Metadata } from "next";
import WorkPageClient from "./WorkPageClient";

const title = "Work — TongYu Xiao";
const description = "Selected projects by TongYu Xiao: Mewa, CornAgent, Myrisle, and Petspace. Experiments in AI, human connection, and everyday life.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/work" },
  openGraph: { title, description, images: ["/xtyopen-logo-preview-white.png"], type: "website", url: "/work" },
  twitter: { card: "summary_large_image", title, description, images: ["/xtyopen-logo-preview-white.png"] },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
