# DSource · 源集

个人优质资源信息台：把推特、YouTube、书籍、加密等领域里值得留下的内容收进来，默认中文展示，带 Looseleaf 手绘纸面 UI。

## 技术栈

- **Next.js**（App Router）+ React 19 + Tailwind v4  
- **Looseleaf**（手绘 shadcn/ui）做前台/后台视觉  
- **Postgres**（Cursor Apps 发布时自动配库；本地用 PGlite）  
- 前台书架浏览 + `/admin` 管理端

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。本地未设置 `DATABASE_URL` 时使用内存库并自动写入样例内容。

## 管理端

- `/admin`：新增 / 编辑 / 删除资源  
- 本地默认开放写入  
- 发布后请绑定密钥 `ADMIN_SECRET`；后台页可把密钥存进浏览器，请求头会带上 `x-admin-secret`

## 内容字段

每条资源同时支持原文与中文：`title` / `title_zh`、`summary` / `summary_zh`、`body` / `body_zh`。前台默认显示中文，可切换「原文」。
