import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-gate"
import { createResource, listResources } from "@/lib/resources"
import { isSafeHttpUrl, sanitizeHttpUrl, sanitizeHttpUrlList } from "@/lib/safe-url"

const urlField = z.string().refine((v) => isSafeHttpUrl(v), { message: "unsafe_url" })

const mediaItemSchema = z.object({
  url: urlField,
  alt: z.string().optional(),
  description: z.string().optional(),
  description_zh: z.string().optional(),
  role: z.enum(["main", "quote"]).optional(),
})

const quoteSchema = z
  .object({
    author_name: z.string(),
    author_handle: z.string(),
    text: z.string(),
    text_zh: z.string().optional(),
    url: urlField.optional().or(z.literal("")),
    media: z.array(mediaItemSchema).optional(),
    quote: z.null().optional(),
  })
  .nullable()

const createSchema = z.object({
  title: z.string().min(1),
  title_zh: z.string().optional(),
  summary: z.string().optional(),
  summary_zh: z.string().optional(),
  body: z.string().optional(),
  body_zh: z.string().optional(),
  source_type: z.string().optional(),
  source_url: urlField.optional().or(z.literal("")),
  source_author: z.string().optional(),
  source_lang: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cover_url: urlField.optional().or(z.literal("")),
  media_urls: z.array(urlField).optional(),
  media: z.array(mediaItemSchema).optional(),
  quote: quoteSchema.optional(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  slug: z.string().optional(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sourceType = url.searchParams.get("type") ?? undefined
  const q = url.searchParams.get("q") ?? undefined
  const includeDrafts = url.searchParams.get("drafts") === "1"
  if (includeDrafts) {
    const denied = requireAdmin(request)
    if (denied) return denied
  }
  const items = await listResources({ includeDrafts, sourceType, q })
  return NextResponse.json({ items }, { headers: { "cache-control": "private, no-store" } })
}

export async function POST(request: Request) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const json = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = {
    ...parsed.data,
    source_url: sanitizeHttpUrl(parsed.data.source_url ?? ""),
    cover_url: sanitizeHttpUrl(parsed.data.cover_url ?? ""),
    media_urls: sanitizeHttpUrlList(parsed.data.media_urls),
    media: parsed.data.media?.map((m) => ({ ...m, url: sanitizeHttpUrl(m.url) })),
    quote: parsed.data.quote
      ? {
          ...parsed.data.quote,
          url: sanitizeHttpUrl(parsed.data.quote.url ?? ""),
          media: parsed.data.quote.media?.map((m) => ({ ...m, url: sanitizeHttpUrl(m.url) })),
          quote: null,
        }
      : parsed.data.quote,
  }
  const item = await createResource(data)
  return NextResponse.json({ item }, { status: 201 })
}
