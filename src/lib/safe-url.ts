/** Allow only http(s) absolute URLs or same-origin relative paths. */
export function isSafeHttpUrl(value: string): boolean {
  const raw = value.trim()
  if (!raw) return true
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return !raw.includes("\\") && !raw.toLowerCase().includes("%2f%2f")
  }
  try {
    const u = new URL(raw)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

export function sanitizeHttpUrl(value: string): string {
  const raw = value.trim()
  if (!raw) return ""
  return isSafeHttpUrl(raw) ? raw : ""
}

export function sanitizeHttpUrlList(values: string[] | undefined): string[] {
  if (!values?.length) return []
  return values.map(sanitizeHttpUrl).filter(Boolean)
}
