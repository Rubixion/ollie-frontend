// GA4 events. gtag is loaded lazily in app/layout.tsx, so this is a no-op until it's there (or when blocked).
export function track(name: string, params?: Record<string, string | number | boolean>) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  gtag?.("event", name, params)
}
