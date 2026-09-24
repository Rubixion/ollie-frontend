# Ollie audit: SEO, performance, accessibility, UI

Date: 2026-09-23 (Phase 1). No code changed yet.
Scope: `ollie-frontend` (Next.js 16.2.6 App Router, React 19, Tailwind 4, deployed to Cloudflare Workers via OpenNext) and the live site `https://www.ollie.ml`.
Stack confirmed from `package.json`, `wrangler.jsonc`, `open-next.config.ts`.

## 0. Context that changes the brief

1. **Only 3 routes are live.** `lib/site-config.ts` sets `MATCH_ONLY = true`. `middleware.ts` 307-redirects every path except `/match`, `/privacy`, `/terms`, `/api`, `/chemistry` and metadata files to `/match`. That includes `/`, `/ai`, `/blog/*`, `/about` and any typo URL. The brief assumes /ai, /blog, /about and the others are live. They aren't.
2. **The product on the site is soccer-player matching, not celebrities.** The H1 reads "Which soccer player do you look like?" The index is 2,223 players / 16,470 images (`hf_space/index.npz`).
3. **The celebrity switch (v2)** is a new index, not a new model:
   - `neural network learning/celeb_v2/` collects the top 5,000 most famous living adults. Fame is ranked from Wikipedia views plus language coverage, and minors, porn and serious criminals are filtered out via Wikidata.
   - It keeps 3–12 verified photos each, only from Wikimedia Commons, only PD/CC0/CC BY/CC BY-SA. Every photo stores author, license and file page.
   - Expected size is ~35–40k images. The run is at ~400 people and finishes in ~15 h. **Final numbers are unknown until then.**
   - The coverage is broad: actors, musicians, athletes, politicians, business people. So "which actor/singer do I look like" is true.
4. **A second Claude session (`neural-networks-ab`) is editing the frontend at the same time**, on the user's instructions. Agreed file split:
   - **ab owns:** `components/celebrity-finder.tsx`, `components/match-info.tsx`, `app/api/search/route.ts`, `components/auth-modal.tsx`, `components/auth-provider.tsx`, `app/privacy`, `app/terms`, `app/blog/**`, `lib/blog-posts*.ts`, `lib/site-config.ts`, `middleware.ts`, `app/sitemap.ts`, `app/robots.ts`, `public/robots.txt`, `app/layout.tsx` (until handed back), `components/nav.tsx`, `components/footer.tsx`, plus `server.py` / `lookalike.py`.
   - **ab's tasks:** celebrity wording, remove the skin-tone "tweaks" mode, add a gender filter, show photo credits, bring back **only the blog** (with SEO and false claims fixed), update privacy/terms, add signup consent checkboxes, and set `SITE_URL = https://ollie.ml`.
   - **This session owns:** `docs/*`, `app/match/page.tsx`, OG images (except blog), `app/not-found.tsx`, `next.config.ts`, `wrangler.jsonc`, `public/llms.txt`, IndexNow, `components/theme-provider.tsx`, and later `app/layout.tsx` fonts/viewport and `app/globals.css`.
   - The findings below say who fixes each one. Findings in ab's files were already sent to ab, and ab has agreed to fold them in.
5. The user told ab to "keep the look and brand colours". This brief asks for a new design system (section 8). **Needs a decision before any restyling.**

## 1. Before metrics (live, Lighthouse 12, mobile, simulated throttling)

| Route | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | JS (transfer / parsed) |
|---|---|---|---|---|---|---|---|---|---|
| /match | 88 | 96 | 93 | 100 | 1.9 s | **3.7 s** | 60 ms | 0 | 273 KB / 908 KB, 10 files |
| /privacy | 88 | 92 | 93 | 100 | 2.0 s | 3.6 s | 110 ms | 0 | 279 KB / 924 KB |
| /terms | 95 | 92 | 93 | 100 | — | — | — | 0 | similar |

- **LCP element on /match:** the H1. TTFB 0.66 s, then **3.0 s render delay**. The H1 is in the server HTML but wrapped in framer-motion with `style="opacity:0;transform:translateY(24px)"`, so it only paints after the JS hydrates.
- **Render-blocking:** a Google Fonts `@import` for *Press Start 2P* (~800–880 ms est.) plus the main CSS (300 ms). The font is only used on the hidden `/info` page.
- **Unused JS:** ~126–136 KiB (framer-motion, supabase-js and lucide load on every page, including the legal pages).
- **Long tasks:** 106 ms and 53 ms on /match during hydration.
- **SEO 100 is misleading.** Lighthouse doesn't check that the canonical resolves, and it doesn't.
- **Not measured yet:** real-user (CrUX) data. The origin is probably too small to have any. A local `next build` bundle breakdown is deferred until ab's edits land, because we share one `.next`.

## 2. Page inventory

Live routes (raw server HTML, not the hydrated DOM):

| | /match | /privacy | /terms |
|---|---|---|---|
| title | `Celebrity Match - Ollie \| Ollie` (brand twice) | `Privacy Policy \| Ollie` | `Terms of Service \| Ollie` |
| description | generic, 95 chars | 64 chars | 60 chars |
| canonical | `https://ollieai.app` (**other domain, homepage**) | `https://ollieai.app/privacy` | `https://ollieai.app/terms` |
| robots | `robots` + `googlebot` duplicated, `keywords` present | same | same |
| H1 | "Which soccer player do you look like?" (in HTML, invisible until JS) | Privacy Policy | Terms of Service |
| outline | 3 hidden `h3` tips **before** the H1, then H1, "How it works" is a `<p>` | H1 then 14 numbered H2s | H1 then 13 numbered H2s |
| OG/Twitter | inherited from layout; `og:url` / `og:image` on ollieai.app; image route returns **500** | same | same |
| JSON-LD | Organization + WebApplication (layout, on every page; featureList says "Siamese") | same | same |
| images | 0 in HTML (results are client-side `<img>`, no width/height, alt = name) | 0 | 0 |
| server-rendered text | H1, intro, the "How it works" 3 bullets. The "More info" details are **not** in the HTML (collapsed = unmounted) | full | full |
| internal links | out: /, /privacy, /terms (plus 3 hidden blog links) | same | same |

Hidden routes (307 → /match): `/` (two H1s: "OLLIE" and an sr-only one), `/ai`, `/blog`, `/blog/[slug]` (90 posts plus 3 standalone post pages that shadow the dynamic route), `/about`, `/contact`, `/feedback`, `/projects`, `/info` (self-`noindex`), `/search` (`noindex`). `/chemistry` returns 200 with an unrelated chemistry page.

## 3. Findings

Severity: **P0** = actively hurting ranking, sharing or the product today. **P1** = significant. **P2** = polish.

### P0

| # | Finding | Evidence | Fix | Owner |
|---|---|---|---|---|
| 1 | **Canonical, sitemap, robots and OG all point at `ollieai.app`, which doesn't resolve (DNS failure).** Google is told the real pages are duplicates of a dead homepage. | `app/layout.tsx:22,50` (`siteUrl` fallback + root `alternates.canonical`), `app/robots.ts:3`, `app/sitemap.ts:4`, `public/robots.txt:6`, `app/blog/layout.tsx:9,13`, `app/blog/[slug]/page.tsx:24-25,94-121,211` | One `SITE_URL`. No root canonical; each page sets a relative, self-referencing one. | ab (agreed) |
| 2 | **Two hosts serve the same site.** `www.ollie.ml` and `ollie.ml` both return 200, with no redirect between them. | `curl` | 301 www → apex (apex is the domain in Supabase/Google OAuth config per `TODO.md`), path-preserved | ab (middleware, agreed) |
| 3 | **Soft 404s.** Any unknown URL 307s to /match (`/nope-404` → /match). | `middleware.ts:12-13` | Unknown paths get a real 404 with a helpful `app/not-found.tsx`. Hidden known pages get a 308. | ab (middleware) + me (not-found) |
| 4 | **OG image route returns HTTP 500** on the live site, so every share preview is broken. The image content is also stale ("83.5% Accuracy · 9,131 Celebrities · 3.3M Training Faces" belongs to the old v1 model). | `app/opengraph-image.tsx:3` `runtime = "edge"` (not supported by OpenNext on Cloudflare), `:98-102` | Drop the edge runtime; redesign with true facts; add a /match-specific image | me |
| 5 | **The product copy describes soccer.** H1, intro, placeholder and loading text, "How it works", privacy §1/§2/§9, terms §2/§7/§10. | `components/celebrity-finder.tsx:260,263,379,391`, `components/match-info.tsx:9,23-24`, `app/privacy/page.tsx:22,27,87`, `app/terms/page.tsx:27,60,75` | Rewrite for celebrities once v2 ships (see §5) | ab (agreed) |
| 6 | **LCP 3.7 s: the H1, uploader and results wrappers ship at `opacity:0`** and wait for hydration. | `components/celebrity-finder.tsx:252-257,272-276,363-367` | Remove `initial` on above-the-fold wrappers | ab (agreed) |
| 7 | **Keyboard users can't upload.** The drop zone is a `<div onClick>` and the file input is `display:none`, so nothing in the flow is focusable (WCAG 2.1.1). | `components/celebrity-finder.tsx:279-328` | `<label>` around an `sr-only` input, visible focus ring | ab (sent) |
| 8 | **Pressing "d" anywhere switches to light mode.** The pages hard-code white text, so /match becomes white-on-white. A single-key shortcut with no way to turn it off fails WCAG 2.1.4. | `components/theme-provider.tsx:37-65` | Delete `ThemeHotkey` (the site is dark-only by design) | me |

### P1

| # | Finding | Evidence | Fix | Owner |
|---|---|---|---|---|
| 9 | Title template doubles the brand | `app/match/page.tsx:10`, `app/feedback/page.tsx` ("Feedback - Ollie") | Child titles without "Ollie" | me (/match), ab (others) |
| 10 | `meta keywords` shipped | `app/layout.tsx:31` | Remove | ab (agreed) |
| 11 | `robots` + `googlebot` meta duplicated | `app/layout.tsx:45-49` | One directive incl. `max-image-preview:large` | ab (agreed) |
| 12 | Sitemap lists 9 static URLs that 307, uses `new Date()` on every build, and uses the dead domain | `app/sitemap.ts` | Only 200 URLs, real dates | ab (agreed) |
| 13 | **"Siamese" claim is wrong, not just inconsistent.** The live model is `SphereFaceNet` (sphere20, 20-layer CNN) trained with CosFace loss (`lfw_pytorch.py:50,153`; `server.py` imports it). `SiameseNet` is the retired v1 class. | `components/footer.tsx:66`, `app/layout.tsx:99`, `components/hero.tsx`, `app/ai/page.tsx`, 22+ blog mentions | Use "a 20-layer convolutional neural network (SphereFace architecture) trained from scratch with CosFace loss" everywhere | ab (footer, layout, blog), me (/match, OG, llms.txt) |
| 14 | `ReferenceError: __name is not defined` in the next-themes inline script on every page (Best Practices −7). This is wrangler's default `keep_names` mangling it. | inline script in `/match` HTML line 10 | `"keep_names": false` in `wrangler.jsonc` | me |
| 15 | Cloudflare Web Analytics is switched on in the dashboard, but the CSP blocks its beacon, so it collects nothing. The privacy policy also says "we do not use third-party analytics". | console error on every page; `next.config.ts:17`; `app/privacy/page.tsx:37` | Decide: allow `static.cloudflareinsights.com` (it's cookieless and reports LCP/INP/CLS per page, which covers RUM with zero code) **and** update the privacy policy, or turn it off | owner decision, then me + ab |
| 16 | Render-blocking Google Fonts `@import` for a font only hidden /info uses; Outfit ships 7 weights | `app/globals.css:1`, `app/layout.tsx:10-20` | Remove the import; subset the weights | me |
| 17 | CSP is loose and carries leftovers: `'unsafe-eval'`, `cdn.jsdelivr.net`, `pubchem.ncbi.nlm.nih.gov` (for /chemistry); no `frame-ancestors`; `x-powered-by: Next.js` sent | `next.config.ts:15-24` | Tighten, add `frame-ancestors 'none'`, `poweredByHeader: false` | me |
| 18 | Results not announced to screen readers; thumbnails lack dimensions | `components/celebrity-finder.tsx:405-472` | `aria-live`, `alt="Photo of …"`, fixed size | ab (sent) |
| 19 | Contrast failures: `text-white/20`–`/40` on placeholder, footer, labels (1.66–3.8:1) | footer, finder placeholder, "How it works" label | ≥ 4.5:1 | ab (their files), me (design tokens) |
| 20 | No skip link; `<header>` and `<footer>` sit inside `<main>`, so they lose their landmark roles | `app/match/page.tsx:16-60` | Restructure /match | me |
| 21 | Hidden tips block renders 3 `h3`s before the H1 | `app/match/page.tsx:21-55` | Replace with a real, visible tips section below the tool | me |
| 22 | `/match` has almost no server-rendered content for crawlers or AI engines to use (H1, one sentence, three bullets). No FAQ, no privacy summary near the uploader, no limitations. | `app/match/page.tsx` | Content blocks (brief §3) as a server component | me |
| 23 | JSON-LD: WebApplication sits in the layout (so on every page) and lists "Siamese neural network". Organization has no logo or `sameAs`. No WebSite, no FAQPage. | `app/layout.tsx:71-102` | WebApplication + FAQPage on /match only | ab (layout), me (/match) |
| 24 | `public/neural networks.code-workspace` is publicly served; `/chemistry` serves an unrelated page with 200 | `public/`, `app/chemistry/route.ts` | Delete both (needs OK: deleting a page) | owner decision |

### P2

- Upload: HEIC drag-drop fails on desktop Chrome with "Couldn't read that image" (iOS Safari transcodes when picking from Photos, so phones are mostly fine). There's no "Take a selfie" `capture` input. The resize runs on the main thread via canvas (one image, probably under 100 ms). Measure INP before moving it to a worker.
- Guest limit is 5 lifetime searches per IP (`lib/search-quota.ts:5`), but `TODO.md` says 1. Copy that says "free" must state the real limit.
- The similarity % is a linear stretch of raw distance (`celebrity-finder.tsx:101-104`), not calibrated. Explain it in a caption and never call it accuracy.
- `favicon`/`icon.svg` is a gradient "O" in the indigo palette. No `apple-icon`, no `manifest`, no `themeColor`.
- `components/ui/*` are stock shadcn primitives (default radius and tokens), and the light-mode tokens in `globals.css` are unused.
- Dead weight in `package.json`:
  - Imported nowhere: `motion` (duplicates `framer-motion`), `uuid`, `usehooks-ts`, `radix-ui`, `@splinetool/*` (`ui/splite.tsx` itself is unimported).
  - Only used by hidden pages: `three`.
  - `shadcn` is a CLI sitting in dependencies.
  - Unimported components: `testimonials-columns-1.tsx`, `ui/splite.tsx`, `ui/8bit-*`, `ui/gooey-filter.tsx`, `components/dotted-surface.tsx`, `effects/entropy.tsx`, `effects/face-feature-viz.tsx`. `radial-orbital-timeline` is used only by hidden /about.
  - Tree-shaking hides most of the bundle cost, but these slow installs and builds.
- `app/blog/find-your-celebrity-lookalike`, `how-face-recognition-works`, `siamese-neural-networks-explained` are standalone pages shadowing `[slug]` (ab is deleting them).

## 4. Stale-copy inventory (previous product and old model)

| Stale fact | Where |
|---|---|
| soccer / player / "2,200+" / "~16,000" | `celebrity-finder.tsx:260,263,379,391`, `match-info.tsx:9,23-24`, `privacy/page.tsx:22,27,87`, `terms/page.tsx:27,60,75` |
| "Siamese" / contrastive loss | `footer.tsx:66`, `layout.tsx:99`, `hero.tsx`, `ai/page.tsx`, `about-client.tsx`, `info/page.tsx`, `faq-section.tsx`, `changelog-section.tsx`, `neural-deep-viz.tsx`, `lib/blog-posts-a.ts` (22 + 13), `-b` (3), `-c` (4), 3 standalone blog pages |
| VGGFace2, CelebA, "9,131 celebrities", "10,177", "3.3M", "83.5%" | `opengraph-image.tsx:98-102`, `page.tsx`, `projects/page.tsx`, `ai/page.tsx`, `about-client.tsx`, `info/page.tsx`, `lib/blog-posts-b.ts`/`-c.ts` (27 VGGFace2, 14 "9,131") |
| "calibrated" (the score isn't) | `lib/blog-posts-a.ts` (4), `-b` (8), `-c` (2), 2 standalone blog pages |
| "Works best with male faces" | `celebrity-finder.tsx:266` (the soccer index was almost all men; v2 is mixed and ab is adding a gender filter) |
| "What's next: full celebrity search" | `match-info.tsx:10,32` (it becomes the present) |

`llms.txt` does not exist. The `celeb_v2` collector's User-Agent already says `https://ollie.ml`.

## 5. "Vibe-coded" tells

Live on /match:
- Indigo-blue accent (`--ollie-cyan: rgb(100,130,210)`, misnamed) with a glow shadow on the CTA (`celebrity-finder.tsx:337`).
- The favicon is a gradient letter.
- Background grid pattern under everything (`BGPattern`, `app/match/page.tsx:17`).
- Tracked all-caps eyebrows: "HOW IT WORKS" (`match-info.tsx:42`), "TOP 5 MATCHES" (`celebrity-finder.tsx:418`), footer "LEGAL".
- Icon-in-a-circle upload and empty states (`celebrity-finder.tsx:311,373`).
- Same `rounded-2xl` + `bg-white/[0.02]` + `border-white/5` on every box.
- Fade/slide-in on load for every block.
- A spinner with "Running your face through the network...".
- The logo is "OLLIE" with `tracking-widest`.
- `backdrop-blur` on nav and menus.

Hidden pages (only relevant if they come back): particle text and dotted Three.js surfaces (`app/page.tsx`, `app/ai/page.tsx`); a radial orbital timeline and gradients (`about-client.tsx`); a Spline 3D embed (`components/ui/splite.tsx`); a testimonials component (`testimonials-columns-1.tsx`, unused, delete it); 20 `→` arrows on /ai; 8-bit "PRESS START" retro styling (`info/page.tsx`); `01–08` numbered sections on /ai.

What's already good and should stay: the "Find my match" label, Ctrl+V paste, the photo kept on network failure, specific quota error messages, the full-size zoom viewer, and the honest privacy/terms text.

## 6. Security headers (live)

Present: HSTS (2 y, preload), `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, CSP, Brotli, immutable caching on hashed assets.
Gaps: see #17. HTML is served `cache-control: s-maxage=31536000` (fine for prerendered pages, since the OpenNext cache is invalidated on deploy).

## 7. Not done yet (and why)

- Screenshots at 9 widths and axe via Playwright: next phase, against a local build once ab's edits land. A single dark theme, so no light-mode pass.
- Bundle analyzer: same reason (shared `.next`).
- Rich Results Test / schema validator: after the JSON-LD is rewritten.
