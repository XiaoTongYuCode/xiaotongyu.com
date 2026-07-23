import type { Metadata } from "next";
import WorkPageClient from "./WorkPageClient";

export const metadata: Metadata = {
  title: "Selected Work | Xiaotong Yu",
  description:
    "Selected products and experiments by Xiaotong Yu across local AI, community software, and playful browser experiences.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Selected Work | Xiaotong Yu",
    description:
      "Selected products and experiments across local AI, community software, and playful browser experiences.",
    type: "website",
    url: "/work",
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
