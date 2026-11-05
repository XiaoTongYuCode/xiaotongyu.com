import type { Metadata } from "next";
import HomePage from "./_components/home/HomePage";
import { HOME_COPY } from "./_components/home/copy";

const { title, description } = HOME_COPY["en-US"].meta;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, images: ["/xtyopen-logo-preview-white.png"], url: "/" },
  twitter: { card: "summary_large_image", title, description, images: ["/xtyopen-logo-preview-white.png"] },
};

export default function Home() {
  return <HomePage />;
}
