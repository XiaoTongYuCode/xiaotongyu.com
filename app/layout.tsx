import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xtyopen | Xiaotong Yu",
  description:
    "Xiaotong Yu's personal site for product engineering, AI experiments, and web notes.",
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
