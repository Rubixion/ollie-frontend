import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Prerendered pages (home, tools, every blog and look-alike page) are served from the build's static assets, and
// cache interception answers them before the Next.js server is even loaded. Without this, every request re-rendered
// the page inside the Worker, which blew the free plan's 10 ms CPU limit (Cloudflare error 1102, 2026-10-01).
// ponytail: static-assets cache = no ISR/revalidation. Switch to the R2 cache if a page ever needs `revalidate`.
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
