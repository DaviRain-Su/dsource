import type { Metadata } from "next"
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const sans = Noto_Sans_SC({
  variable: "--font-cjk-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const serif = Noto_Serif_SC({
  variable: "--font-cjk-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "DSource · 源集",
  description: "个人优质资源信息台：推特、视频、书籍、加密……默认中文展示。",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="stylesheet" href="https://kevintngo.github.io/looseleaf/fonts/kevin-sans.css" />
      </head>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
