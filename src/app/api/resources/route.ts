import { NextResponse } from "next/server"
import { z } from "zod"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { createResource } from "@/lib/resources"
import { isSafeHttpUrl, sanitizeHttpUrl, sanitizeHttpUrlList } from "@/lib/safe-url"
import { listResources } from "@/lib/resources"

const urlField = z.string().refine((v) => isSafeHttpUrl(v), { message: "unsafe_url" })

const createSchema = z.object({
  title: z.string().min(1),
  title_zh: z.string().optional(),
  summary: z.string().optional(),
  summary_zh: z.string().optional(),
  body: z.string().optional(),
  body_zh: z.string().optional(),
  source_type: z.string().optional(),
  source_url: urlField.optional(),
  source_author: z.string().optional(),
  source_lang: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cover_url: urlField.optional(),
  media_urls: z.array(urlField).optional(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  slug: z.string().optional(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sourceType = url.searchParams.get("type") ?? undefined
  const q = url.searchParams.get("q") ?? undefined
  const includeDrafts = url.searchParams.get("drafts") === "1"
  if (includeDrafts && !isAdminAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const items = await listResources({ includeDrafts, sourceType, q })
  return NextResponse.json(
    { items, sample: !process.env.DATABASE_URL },
    { headers: { "cache-control": "private, no-store" } },
  )
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
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
  }
  const item = await createResource(data)
  return NextResponse.json({ item }, { status: 201 })
}
