import type { ResourceInput } from "@/lib/types"

const KARPATHY_TEXT = `We'll be spending a lot more time trying to understand the outputs of language models. A few thoughts, tips & tricks:

Writing. Something I've had success with: Ask your LLM to explain something in ASD-STE100, it's a controlled language specification originally developed for aerospace maintenance documentation. LLMs well-versed in this language and it comes with heavy constraints on clean writing style that I often find a lot more readable. Sometimes I've tried to soften it a bit e.g. ask for "80% of the way to ASD-STE100" because the spec is quite stringent. But even better:

Diagrams / images. Instead of writing, ask your LLM to create a diagram. These can be a lot easier to process, parse, and understand. But even better:

Web pages. Ask for output "in HTML" to get a beautiful, interactive webpage. LLMs are getting really good at frontend and can create beautiful experiences, animations, etc. But even better:

Explainer videos. The output format I am most bullish on is fully custom / bespoke explainer videos generated on any arbitrary topic. Experiment with things like "Create a 3b1b style video explainer on X. Use my ElevenLabs API key for audio narration". (you'd need an API key for the latter or you can ask your LLM to find you decent free alternatives that use your local compute). This is actually starting to work!

In summary:
- As LLMs get better, they will do more and more of the legwork autonomously, and a lot more of our work will rise up the abstractions into oversight and understanding.
- Luckily, LLMs can help here too because as intelligence and code are increasingly abundant, you can ask for large, custom, discardable software artifacts (e.g. web apps, video explainers) that would have never made sense to create before. Push the boundaries here and you'll be surprised.`

const KARPATHY_TEXT_ZH = `我们会花越来越多时间去理解语言模型的输出。一些想法与技巧：

写作。我试过有效的做法：让 LLM 用 ASD-STE100 来解释——这是最初为航空航天维护文档设计的受控语言规范。模型很熟悉这套约束，写出的文字往往更干净、更好读。有时我会放宽一点，比如要求「八成接近 ASD-STE100」，因为原规范很严。但还可以更好：

图示。别只写字，让模型画图；往往更好扫、更好懂。还可以更好：

网页。要求「用 HTML 输出」，得到可交互的漂亮页面。前端能力越来越强。还可以更好：

讲解视频。我最看好完全定制的讲解视频。例如：「用 3Blue1Brown 风格做一段关于 X 的讲解视频，旁白用我的 ElevenLabs key」。没有 key 也可以让模型找本地算力的替代方案——这已经开始能用了。

总结：
- 模型越强，越会自己干脏活，我们的工作会上移到监督与理解。
- 智能与代码越来越充裕，你可以要求以前不值得做的大型可抛弃工件（网页、讲解视频）。把边界往外推，你会吃惊。`

/** First curated item: Oasis Feng on recursive self-contained outlines (quotes Karpathy) */
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
    media: [
      {
        url: "/media/oasisfeng-demo.jpg",
        alt: "ChatGPT 以递归自包含分级列表作答的示例截图",
        description: "A tall dark-mode screenshot of a hierarchical indented ChatGPT answer.",
        description_zh: "深色界面截图：ChatGPT 用多级缩进列表作答，外层概括内层。",
        role: "main",
      },
      {
        url: "/media/oasisfeng-prompt.jpg",
        alt: "系统提示词「输出格式」截图",
        description:
          "System prompt titled 输出格式: answers should use hierarchical indented structure; each outer level must summarize the core of the next level.",
        description_zh:
          "系统提示「输出格式」：对话回答用分级缩进；除最末级外，外层必须概括下一层核心信息，便于按需深入阅读。",
        role: "main",
      },
    ],
    quote: {
      author_name: "Andrej Karpathy",
      author_handle: "karpathy",
      url: "https://x.com/karpathy/status/2105819303471976479",
      text: KARPATHY_TEXT,
      text_zh: KARPATHY_TEXT_ZH,
      media: [
        {
          url: "/media/karpathy-asd-ste100.jpg",
          alt: "Karpathy tips card mentioning ASD-STE100, diagrams, HTML, explainer videos",
          description:
            "Wide tip card: Writing (ASD-STE100), Diagrams/images, Web pages (HTML), Explainer videos.",
          description_zh:
            "横幅提示卡：写作（ASD-STE100）、图示、HTML 网页、讲解视频四层递进建议。",
          role: "quote",
        },
      ],
      quote: null,
    },
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
    media: [],
    quote: null,
    status: "published",
    featured: false,
  },
]
