import type { Metadata } from "next";
import DotMorphReplica from "../_components/datacurve-replica/DotMorphReplica";
import { PERSON_NAME_EN } from "../_seo/site";

const title = `About — ${PERSON_NAME_EN}`;
const description = "I'm TongYu Xiao, a software engineer in Beijing. A little about how I think, what I make, and the details I care about.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, images: ["/xtyopen-logo-preview-white.png"], type: "website", url: "/about" },
  twitter: { card: "summary_large_image", title, description, images: ["/xtyopen-logo-preview-white.png"] },
};

export default function AboutPage() {
  return <DotMorphReplica />;
}
