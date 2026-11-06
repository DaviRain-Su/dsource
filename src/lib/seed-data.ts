import type { ResourceInput } from "@/lib/types"

/** First curated item: Oasis Feng on recursive self-contained outlines */
export const SEED_RESOURCES: Array<ResourceInput & { id: string; slug: string }> = [
  {
    id: "oasisfeng-recursive-outline",
    slug: "oasisfeng-recursive-outline",
    title: "Recursive self-contained outline for LLM answers",
    title_zh: "用「递归自包含分级列表」治好 GPT 冗长回答",
    summary:
      "Inspired by Karpathy's ASD-STE100 tip, Oasis Feng prompts ChatGPT to answer in recursive self-contained indented outlines so you can skim outer layers and only dive into what matters.",
    summary_zh:
      "受 Karpathy 用 ASD-STE100 规范引导 LLM 文风的启发，Oasis Feng 用系统提示词要求 ChatGPT 以「递归自包含分级列表」作答，外层概括内层核心，扫读即可，不必再被冗长段落逼出 TL;DR。",
    body: `Inspired by Karpathy sharing ASD-STE100 as a way to steer LLM prose, Oasis Feng asks ChatGPT (via system prompt) to answer with a recursive self-contained hierarchical list.

Rules (from his prompt screenshot):
- Dialogue answers should use indented hierarchical structure, except when clearly unsuitable (dialogue only — not for documents).
- Every outer level must summarize the core of the next level (not empty structural headings). Readers can skim outer layers without missing the point, and open deeper layers only when needed.

Source: https://x.com/oasisfeng/status/2118687812988076219`,
    body_zh: `受此前 Karpathy 分享的用 ASD-STE100 规范引导 LLM 语言风格的启发，最近通过系统提示词要求 ChatGPT 用「递归自包含分级列表」格式，终于解决了长期以来被 GPT 过于冗长的回答而逼出的 TL;DR 不良心理。现在基本可以做到「一目十行」扫过回答，只在关键信息上花费注意力。

## 输出格式（提示词要点）

- 对话的回答输出应使用分级缩进的结构化格式，除了明显不适用的情况：（仅限对话中的回答，不得应用于文档等其它内容输出）
- 除最末一级缩进外，更外层缩进层级的文字均应能概括下一层级的核心内容（而不是像大多数传统小节标题那样只提供结构性标签而不涉及小节内的核心信息）。确保阅读者可以根据自己的理解程度选择性阅读更内层缩进层级的内容，而不会漏掉核心信息。

## 为什么值得收录

- 外层 = 可扫读的结论；内层 = 细节与论据
- 直接改善「跳读 / 拉到底」的阅读习惯
- 与 Karpathy 的受控语言（ASD-STE100）思路一脉相承：约束输出形态，换取可理解性

原文：https://x.com/oasisfeng/status/2118687812988076219`,
    source_type: "twitter",
    source_url: "https://x.com/oasisfeng/status/2118687812988076219",
    source_author: "Oasis Feng (@oasisfeng)",
    source_lang: "zh",
    tags: ["llm", "提示词", "阅读", "karpathy", "生产力"],
    cover_url: "/media/oasisfeng-demo.jpg",
    media_urls: ["/media/oasisfeng-demo.jpg", "/media/oasisfeng-prompt.jpg"],
    status: "published",
    featured: true,
  },
  {
    id: "welcome-dsource",
    slug: "welcome-dsource",
    title: "Welcome to DSource",
    title_zh: "欢迎来到 DSource · 源集",
    summary: "A personal desk for quality finds — tweets, videos, books, crypto notes — gathered and shown in Chinese first.",
    summary_zh:
      "这是你的个人优质信息台：把推特、视频、书籍、加密等领域里值得留下的东西收进来，默认用中文展示，也能翻看原文。",
    body: "Use the shelf on the left to browse by source type. Open Admin to add more pages.",
    body_zh: `## 怎么用

- 左侧书架按来源类型浏览（推特 / 视频 / 书籍 / 加密 …）
- 点开一张纸片即可阅读；有原文时可以切换「中文 / 原文」
- 进入「后台」可新增、编辑、下架内容

## 收录原则

- 宁可少，也要好
- 能说清「为什么值得留下」
- 尽量补上中文摘要与正文，方便日后回看`,
    source_type: "other",
    source_url: "",
    source_author: "DSource",
    source_lang: "zh",
    tags: ["站点", "说明"],
    cover_url: "",
    media_urls: [],
    status: "published",
    featured: false,
  },
]
