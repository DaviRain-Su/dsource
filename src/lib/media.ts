export type MediaItem = {
  url: string
  alt?: string
  description?: string
  description_zh?: string
  /** "main" | "quote" — reserved for future nesting; UI only renders one quote level */
  role?: "main" | "quote"
}

export type QuoteRef = {
  author_name: string
  author_handle: string
  text: string
  text_zh?: string
  url?: string
  media?: MediaItem[]
  /** reserved for a future second level; do not populate yet */
  quote?: QuoteRef | null
}

export function mediaUrlsFrom(media: MediaItem[] | undefined, fallback: string[] = []): string[] {
  if (media?.length) return media.map((m) => m.url).filter(Boolean)
  return fallback
}

export function coerceMedia(
  media: unknown,
  fallbackUrls: string[] = [],
): MediaItem[] {
  if (Array.isArray(media) && media.length > 0) {
    return media
      .map((row) => {
        if (!row || typeof row !== "object") return null
        const r = row as Record<string, unknown>
        const url = String(r.url ?? "").trim()
        if (!url) return null
        return {
          url,
          alt: String(r.alt ?? ""),
          description: String(r.description ?? ""),
          description_zh: String(r.description_zh ?? ""),
          role: r.role === "quote" ? "quote" : "main",
        } satisfies MediaItem
      })
      .filter(Boolean) as MediaItem[]
  }
  return fallbackUrls.filter(Boolean).map((url) => ({ url, alt: "", description: "", description_zh: "", role: "main" as const }))
}

export function coerceQuote(raw: unknown): QuoteRef | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const author_handle = String(r.author_handle ?? "").trim()
  const text = String(r.text ?? "").trim()
  if (!author_handle && !text) return null
  return {
    author_name: String(r.author_name ?? ""),
    author_handle: author_handle.replace(/^@/, ""),
    text,
    text_zh: String(r.text_zh ?? ""),
    url: String(r.url ?? ""),
    media: coerceMedia(r.media, []),
    quote: null,
  }
}
