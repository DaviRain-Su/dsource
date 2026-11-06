import { NextResponse } from "next/server"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { limitAdminAction } from "@/lib/rate-limit"

/** Shared gate for admin-sensitive API handlers: rate limit, then auth. */
export function requireAdmin(request: Request): NextResponse | null {
  const limited = limitAdminAction(request)
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "retry-after": String(limited.retryAfterSec),
          "cache-control": "private, no-store",
        },
      },
    )
  }
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  return null
}
