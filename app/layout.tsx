import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XiaoTongYu",
  description:
    "Xiaotong Yu's personal site for product engineering, AI experiments, and web notes.",
  icons: {
    icon: [{ url: "/xtyopen-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
