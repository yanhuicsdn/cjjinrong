import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "美股市场泡沫追踪器 - Market Bubble Tracker",
  description: "实时监控标普500/黄金比率与债券利差,精准把握市场风险,避免在泡沫顶峰接盘",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
