import { NextResponse } from "next/server"
import { z } from "zod"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { deleteResource, getResource, updateResource } from "@/lib/resources"
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

const updateSchema = z.object({
  title: z.string().min(1).optional(),
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

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const item = await getResource(id)
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (item.status !== "published" && !isAdminAuthorized(request)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  return NextResponse.json({ item }, { headers: { "cache-control": "private, no-store" } })
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await ctx.params
  const json = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = {
    ...parsed.data,
    ...(parsed.data.source_url !== undefined
      ? { source_url: sanitizeHttpUrl(parsed.data.source_url) }
      : {}),
    ...(parsed.data.cover_url !== undefined
      ? { cover_url: sanitizeHttpUrl(parsed.data.cover_url) }
      : {}),
    ...(parsed.data.media_urls !== undefined
      ? { media_urls: sanitizeHttpUrlList(parsed.data.media_urls) }
      : {}),
    ...(parsed.data.media !== undefined
      ? {
          media: parsed.data.media.map((m) => ({ ...m, url: sanitizeHttpUrl(m.url) })),
        }
      : {}),
    ...(parsed.data.quote !== undefined
      ? {
          quote: parsed.data.quote
            ? {
                ...parsed.data.quote,
                url: sanitizeHttpUrl(parsed.data.quote.url ?? ""),
                media: parsed.data.quote.media?.map((m) => ({
                  ...m,
                  url: sanitizeHttpUrl(m.url),
                })),
                quote: null,
              }
            : null,
        }
      : {}),
  }
  const item = await updateResource(id, data)
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(request: Request, ctx: Ctx) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await ctx.params
  const ok = await deleteResource(id)
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
