import { randomUUID } from "node:crypto"
import { sql } from "@/lib/db"
import { coerceMedia, coerceQuote, mediaUrlsFrom } from "@/lib/media"
import { SEED_RESOURCES } from "@/lib/seed-data"
import type { Resource, ResourceInput } from "@/lib/types"

let seeded = false

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
  return base || `item-${Date.now().toString(36)}`
}

function mapRow(row: Record<string, unknown>): Resource {
  const media_urls = Array.isArray(row.media_urls) ? (row.media_urls as string[]) : []
  const media = coerceMedia(row.media, media_urls)
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    title_zh: String(row.title_zh ?? ""),
    summary: String(row.summary ?? ""),
    summary_zh: String(row.summary_zh ?? ""),
    body: String(row.body ?? ""),
    body_zh: String(row.body_zh ?? ""),
    source_type: String(row.source_type ?? "article"),
    source_url: String(row.source_url ?? ""),
    source_author: String(row.source_author ?? ""),
    source_lang: String(row.source_lang ?? "zh"),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    cover_url: String(row.cover_url ?? ""),
    media_urls: mediaUrlsFrom(media, media_urls),
    media,
    quote: coerceQuote(row.quote),
    status: String(row.status ?? "published"),
    featured: Boolean(row.featured),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

function packInput(input: ResourceInput | (ResourceInput & { id: string; slug: string })) {
  const media = coerceMedia(input.media, input.media_urls ?? [])
  const media_urls = mediaUrlsFrom(media, input.media_urls ?? [])
  const quote = input.quote === undefined ? undefined : coerceQuote(input.quote)
  return { media, media_urls, quote }
}

export async function ensureSeeded(): Promise<void> {
  if (seeded) return
  const existing = await sql<{ count: string }>("select count(*)::text as count from resources")
  if (Number(existing[0]?.count ?? 0) === 0) {
    for (const item of SEED_RESOURCES) {
      const packed = packInput(item)
      await sql(
        `insert into resources (
          id, slug, title, title_zh, summary, summary_zh, body, body_zh,
          source_type, source_url, source_author, source_lang, tags,
          cover_url, media_urls, media, quote, status, featured
        ) values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,$18,$19
        ) on conflict (id) do nothing`,
        [
          item.id,
          item.slug,
          item.title,
          item.title_zh ?? "",
          item.summary ?? "",
          item.summary_zh ?? "",
          item.body ?? "",
          item.body_zh ?? "",
          item.source_type ?? "article",
          item.source_url ?? "",
          item.source_author ?? "",
          item.source_lang ?? "zh",
          item.tags ?? [],
          item.cover_url ?? "",
          packed.media_urls,
          JSON.stringify(packed.media),
          packed.quote ? JSON.stringify(packed.quote) : null,
          item.status ?? "published",
          item.featured ?? false,
        ],
      )
    }
  } else {
    // Backfill quote/media onto the first Oasis Feng seed if an older row is missing them.
    const oasis = SEED_RESOURCES.find((r) => r.id === "oasisfeng-recursive-outline")
    if (oasis?.quote) {
      const packed = packInput(oasis)
      await sql(
        `update resources set
           media = $2::jsonb,
           quote = $3::jsonb,
           media_urls = $4,
           updated_at = now()
         where id = $1 and quote is null`,
        [
          oasis.id,
          JSON.stringify(packed.media),
          JSON.stringify(packed.quote),
          packed.media_urls,
        ],
      )
    }
  }
  seeded = true
}

export async function listResources(opts?: {
  includeDrafts?: boolean
  sourceType?: string
  q?: string
}): Promise<Resource[]> {
  await ensureSeeded()
  const params: unknown[] = []
  const where: string[] = []

  if (!opts?.includeDrafts) {
    where.push(`status = 'published'`)
  }
  if (opts?.sourceType && opts.sourceType !== "all") {
    params.push(opts.sourceType)
    where.push(`source_type = $${params.length}`)
  }
  if (opts?.q?.trim()) {
    params.push(`%${opts.q.trim()}%`)
    const i = params.length
    where.push(
      `(title ilike $${i} or title_zh ilike $${i} or summary ilike $${i} or summary_zh ilike $${i} or source_author ilike $${i})`,
    )
  }

  const clause = where.length ? `where ${where.join(" and ")}` : ""
  const rows = await sql(
    `select * from resources ${clause}
     order by featured desc, updated_at desc`,
    params,
  )
  return rows.map(mapRow)
}

export async function getResource(idOrSlug: string): Promise<Resource | null> {
  await ensureSeeded()
  const rows = await sql(
    `select * from resources where id = $1 or slug = $1 limit 1`,
    [idOrSlug],
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function createResource(input: ResourceInput): Promise<Resource> {
  await ensureSeeded()
  const id = randomUUID()
  const slug = input.slug?.trim() || slugify(input.title_zh || input.title)
  const packed = packInput(input)
  const rows = await sql(
    `insert into resources (
      id, slug, title, title_zh, summary, summary_zh, body, body_zh,
      source_type, source_url, source_author, source_lang, tags,
      cover_url, media_urls, media, quote, status, featured, updated_at
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,$18,$19, now()
    ) returning *`,
    [
      id,
      slug,
      input.title,
      input.title_zh ?? "",
      input.summary ?? "",
      input.summary_zh ?? "",
      input.body ?? "",
      input.body_zh ?? "",
      input.source_type ?? "article",
      input.source_url ?? "",
      input.source_author ?? "",
      input.source_lang ?? "zh",
      input.tags ?? [],
      input.cover_url ?? "",
      packed.media_urls,
      JSON.stringify(packed.media),
      packed.quote ? JSON.stringify(packed.quote) : null,
      input.status ?? "published",
      input.featured ?? false,
    ],
  )
  return mapRow(rows[0])
}

export async function updateResource(
  id: string,
  input: Partial<ResourceInput>,
): Promise<Resource | null> {
  await ensureSeeded()
  const current = await getResource(id)
  if (!current) return null

  const mergedMedia =
    input.media !== undefined
      ? coerceMedia(input.media, input.media_urls ?? current.media_urls)
      : input.media_urls !== undefined
        ? coerceMedia(undefined, input.media_urls)
        : current.media
  const media_urls = mediaUrlsFrom(mergedMedia, input.media_urls ?? current.media_urls)
  const quote =
    input.quote !== undefined ? coerceQuote(input.quote) : current.quote

  const next = {
    title: input.title ?? current.title,
    title_zh: input.title_zh ?? current.title_zh,
    summary: input.summary ?? current.summary,
    summary_zh: input.summary_zh ?? current.summary_zh,
    body: input.body ?? current.body,
    body_zh: input.body_zh ?? current.body_zh,
    source_type: input.source_type ?? current.source_type,
    source_url: input.source_url ?? current.source_url,
    source_author: input.source_author ?? current.source_author,
    source_lang: input.source_lang ?? current.source_lang,
    tags: input.tags ?? current.tags,
    cover_url: input.cover_url ?? current.cover_url,
    media_urls,
    media: mergedMedia,
    quote,
    status: input.status ?? current.status,
    featured: input.featured ?? current.featured,
    slug: input.slug ?? current.slug,
  }

  const rows = await sql(
    `update resources set
      slug=$2, title=$3, title_zh=$4, summary=$5, summary_zh=$6,
      body=$7, body_zh=$8, source_type=$9, source_url=$10, source_author=$11,
      source_lang=$12, tags=$13, cover_url=$14, media_urls=$15,
      media=$16::jsonb, quote=$17::jsonb,
      status=$18, featured=$19, updated_at=now()
     where id=$1
     returning *`,
    [
      current.id,
      next.slug,
      next.title,
      next.title_zh,
      next.summary,
      next.summary_zh,
      next.body,
      next.body_zh,
      next.source_type,
      next.source_url,
      next.source_author,
      next.source_lang,
      next.tags,
      next.cover_url,
      next.media_urls,
      JSON.stringify(next.media),
      next.quote ? JSON.stringify(next.quote) : null,
      next.status,
      next.featured,
    ],
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function deleteResource(id: string): Promise<boolean> {
  await ensureSeeded()
  const rows = await sql(`delete from resources where id = $1 returning id`, [id])
  return rows.length > 0
}
