import { NextResponse } from "next/server"
import { z } from "zod"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { createResource, listResources } from "@/lib/resources"

const createSchema = z.object({
  title: z.string().min(1),
  title_zh: z.string().optional(),
  summary: z.string().optional(),
  summary_zh: z.string().optional(),
  body: z.string().optional(),
  body_zh: z.string().optional(),
  source_type: z.string().optional(),
  source_url: z.string().optional(),
  source_author: z.string().optional(),
  source_lang: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cover_url: z.string().optional(),
  media_urls: z.array(z.string()).optional(),
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
  const item = await createResource(parsed.data)
  return NextResponse.json({ item }, { status: 201 })
}
