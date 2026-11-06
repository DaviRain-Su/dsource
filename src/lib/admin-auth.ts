export function isAdminAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET?.trim() ?? ""
  if (!secret) {
    // Local / sample mode: writes are open until ADMIN_SECRET is bound on publish.
    return true
  }
  const header = request.headers.get("x-admin-secret")?.trim() ?? ""
  const cookie = parseCookie(request.headers.get("cookie") ?? "").admin_secret
  return header === secret || cookie === secret
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
