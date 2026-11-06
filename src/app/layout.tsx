import type { CSSProperties, ReactNode } from "react"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata = {
  title: "DSource · 源集",
  description: "个人优质资源信息台：推特、视频、书籍、加密……默认中文展示。",
}

const cjkVars = {
  "--font-cjk-sans": '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  "--font-cjk-serif": '"Noto Serif SC", "Songti SC", "SimSun", serif',
} as CSSProperties

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" style={cjkVars}>
      <head>
        {/* Self-hosted — Preview must not wait on github.io / fonts.googleapis.com */}
        <link rel="stylesheet" href="/fonts/kevin-sans.css" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
