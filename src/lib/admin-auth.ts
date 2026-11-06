/** Write/draft access always requires a configured ADMIN_SECRET match. */
export function isAdminAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET?.trim() ?? ""
  if (!secret) return false

  const header = request.headers.get("x-admin-secret")?.trim() ?? ""
  const cookie = parseCookie(request.headers.get("cookie") ?? "").admin_secret
  return timingSafeEqual(header, secret) || timingSafeEqual(cookie, secret)
}

function parseCookie(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=")
    if (!k) continue
    out[k] = decodeURIComponent(rest.join("=") || "")
  }
  return out
}

function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
