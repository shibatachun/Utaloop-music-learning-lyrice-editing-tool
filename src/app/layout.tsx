import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UtaLoop",
  description: "YouTube singing practice with synchronized karaoke lyrics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
