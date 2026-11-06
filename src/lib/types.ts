export const SOURCE_TYPES = [
  "twitter",
  "youtube",
  "book",
  "crypto",
  "article",
  "tool",
  "other",
] as const

export type SourceType = (typeof SOURCE_TYPES)[number]

export type Resource = {
  id: string
  slug: string
  title: string
  title_zh: string
  summary: string
  summary_zh: string
  body: string
  body_zh: string
  source_type: SourceType | string
  source_url: string
  source_author: string
  source_lang: string
  tags: string[]
  cover_url: string
  media_urls: string[]
  status: "draft" | "published" | string
  featured: boolean
  created_at: string
  updated_at: string
}

export type ResourceInput = {
  title: string
  title_zh?: string
  summary?: string
  summary_zh?: string
  body?: string
  body_zh?: string
  source_type?: string
  source_url?: string
  source_author?: string
  source_lang?: string
  tags?: string[]
  cover_url?: string
  media_urls?: string[]
  status?: string
  featured?: boolean
  slug?: string
}

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  twitter: "推特",
  youtube: "视频",
  book: "书籍",
  crypto: "加密",
  article: "文章",
  tool: "工具",
  other: "其他",
}

export function displayTitle(resource: Resource, preferZh = true): string {
  if (preferZh && resource.title_zh.trim()) return resource.title_zh
  return resource.title || resource.title_zh
}

export function displaySummary(resource: Resource, preferZh = true): string {
  if (preferZh && resource.summary_zh.trim()) return resource.summary_zh
  return resource.summary || resource.summary_zh
}

export function displayBody(resource: Resource, preferZh = true): string {
  if (preferZh && resource.body_zh.trim()) return resource.body_zh
  return resource.body || resource.body_zh
}
