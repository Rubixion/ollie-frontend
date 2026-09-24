import { createClient } from "@supabase/supabase-js"

// Search limits, stored in Supabase (see supabase/search_limits.sql) because Cloudflare Workers
// keep no memory between requests, so an in-process counter can't enforce anything.
// "Lifetime" below really means 90 days: search_log rows are purged after that (supabase/search_limits.sql).
export const GUEST_LIMIT = 5          // free searches per IP address without an account (lifetime)
export const USER_LIMIT = 100         // searches per account, kept high and not shown to users (token cost guard, not a real cap)...
const USER_WINDOW: string | null = null // ...ever (null). Use e.g. "24 hours" for a daily allowance.
const IP_LIMIT = 30                   // searches per IP address...
const IP_WINDOW = "24 hours"          // ...per rolling window (stops one person making many accounts)

export type Quota =
  | { ok: true; used: number | null; logId: number | null } // used/logId null = exempt account, nothing counted
  | { ok: false; reason: "user_limit" | "ip_limit" | "unavailable" }

// Accounts that skip every limit, by Supabase user id (Authentication -> Users -> "User UID").
// Not by email: with email confirmation off, anyone could sign up with your address first.
function isExempt(userId: string): boolean {
  const ids = (process.env.RATE_LIMIT_EXEMPT_USER_IDS ?? "").split(",").map((s) => s.trim())
  return ids.includes(userId)
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Stable uuid per IP, so a guest can use the same quota code as an account (search_log.user_id is a uuid). */
export async function guestId(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("guest:" + ip))
  const h = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/** Counts one search against the user and the IP, atomically. Fails closed if the limiter is unreachable. */
export async function consumeSearch(userId: string, ip: string, userLimit = USER_LIMIT): Promise<Quota> {
  if (isExempt(userId)) return { ok: true, used: null, logId: null }

  const db = serviceClient()
  if (!db) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set: refusing searches rather than running unlimited")
    return { ok: false, reason: "unavailable" }
  }
  const { data, error } = await db.rpc("consume_search", {
    p_user: userId,
    p_ip: ip,
    p_user_limit: userLimit,
    p_ip_limit: IP_LIMIT,
    p_user_window: USER_WINDOW,
    p_ip_window: IP_WINDOW,
  })
  const row = Array.isArray(data) ? data[0] : null
  if (error || !row) {
    console.error("consume_search failed:", error?.message)
    return { ok: false, reason: "unavailable" }
  }
  if (row.status !== "ok") return { ok: false, reason: row.status === "user_limit" ? "user_limit" : "ip_limit" }
  return { ok: true, used: row.used, logId: row.log_id }
}

/** Gives a search back when the search server failed, so an outage doesn't eat the user's allowance. */
export async function refundSearch(quota: Quota): Promise<void> {
  if (!quota.ok || quota.logId === null) return
  const { error } = await serviceClient()?.rpc("refund_search", { p_id: quota.logId }) ?? {}
  if (error) console.error("refund_search failed:", error.message)
}
