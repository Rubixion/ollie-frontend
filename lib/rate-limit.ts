const store = new Map<string, number[]>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) return false
  hits.push(now)
  store.set(key, hits)
  return true
}

export function getIp(req: Request): string {
  // cf-connecting-ip is set by Cloudflare and can't be forged by the client;
  // x-forwarded-for can (its first entry is whatever the client sent), so it's only the local-dev fallback.
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  )
}
