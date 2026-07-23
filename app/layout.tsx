import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import StyledJsxRegistry from "./styled-jsx-registry";

export const metadata: Metadata = {
  metadataBase: new URL("https://xiaotongyu.com"),
  title: "XiaoTongYu | Product Engineering & AI Experiments",
  description:
    "Xiaotong Yu's personal site for product engineering, AI applications, creative coding, and web experiments.",
  icons: {
    icon: [{ url: "/xtyopen-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "XiaoTongYu | Product Engineering & AI Experiments",
    description:
      "Useful products, AI tools, creative coding, and thoughtful web experiments by Xiaotong Yu.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "XiaoTongYu | Product Engineering & AI Experiments",
    description:
      "Useful products, AI tools, creative coding, and thoughtful web experiments by Xiaotong Yu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
        <Analytics />
      </body>
    </html>
  );
}
