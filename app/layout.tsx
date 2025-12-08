import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clean Nav - 极简导航页",
  description: "Clean Nav - 一个干净、极简、由 GitHub 驱动的静态导航主页。支持自定义壁纸、拖拽排序，并利用 GitHub API 实现无服务器数据同步。",
  keywords: "Clean Nav, 导航页, 个人主页, 极简导航, 开源项目, Next.js, Vercel, 静态网站, GitHub API, XiaoMo",
  authors: [{ name: "XiaoMo", url: "https://nav.ovoxo.cc" }],
  robots: "index, follow",
  openGraph: {
    title: "Clean Nav - 极简导航页",
    description: "一个干净、极简、由 GitHub 驱动的静态导航主页。",
    url: "https://nav.ovoxo.cc",
    siteName: "Clean Nav",
    images: [
      {
        url: "https://nav.ovoxo.cc/og-image.png", 
        width: 1200,
        height: 630,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}