# Ollie SEO, performance and accessibility report

Date: 2026-09-24. Companion to `docs/AUDIT.md` (findings) and `docs/DESIGN.md` (design rules).

- **"Before"** = the live site (www.ollie.ml) on 2026-09-23.
- **"After"** = a local production build (`next build && next start`) of branch `dev` on 2026-09-24. It isn't deployed yet, so re-run these on the live site after deploying.
- All runs are Lighthouse 12, mobile, simulated throttling.

## Before / after

| | Before (live) | After (local build) |
|---|---|---|
| /match Performance · Accessibility · Best practices · SEO | 88 · 96 · 93 · 100* | 95 · 100 · 100 · 100 |
| /privacy | 88 · 92 · 93 · 100* | 94 · 100 · 100 · 100 |
| /contact, /blog, a blog post | redirected to /match | 95 · 100 · 100 · 100 (blog index: 93 perf) |
| /match LCP, observed (real trace) | 1.41 s | **0.27 s** (= FCP; the H1 no longer waits for JavaScript) |
| /match LCP, simulated slow phone | 3.7 s | 3.0 s (limited by the JavaScript bundle, see "Next") |
| /match FCP, simulated | 1.9 s | 0.9 s |
| /match TBT / CLS | 60 ms / 0 | 62 ms / 0 |
| /match JavaScript (transfer / parsed) | 273 KB / 908 KB | 276 KB / 924 KB (unchanged; see "Next") |
| Console errors | 2 (`__name` crash, CSP-blocked analytics) | 0 |
| Indexable, correctly canonicalised URLs | 0 (every canonical pointed at a domain Ollie doesn't own) | 95 in the sitemap: /match, /blog, 90 posts, /contact, /privacy, /terms |
| Share preview image | HTTP 500 | 200, page-specific for /match, /blog and each post |
| Unknown URL | 307 → /match (soft 404) | real 404 page |
| Structured data | Organization + WebApplication on every page | Organization and WebSite sitewide; WebApplication and FAQPage on /match; Blog on /blog; BlogPosting, BreadcrumbList and FAQPage on posts |

\* SEO 100 before was misleading, because Lighthouse doesn't check that the canonical resolves.

The simulated LCP is Lighthouse's estimate for a slow phone on slow 4G. The observed trace shows the page now paints its largest element on first paint. Real-user numbers will come from Cloudflare Web Analytics, which the security policy was blocking before.

## What changed

Details are in the git history and `AUDIT.md`.

**/match content and structured data**
- /match now has server-rendered content below the tool: how it works, photo tips (linked to three blog posts), limitations, what happens to your photo, 8 FAQs and an about-the-model section.
- WebApplication and FAQPage JSON-LD are generated from the same text that's on the page.

**Domain and crawling**
- One domain, `https://ollie.ml`, with self-referencing canonicals on every page.
- `robots.txt` allows all crawlers, AI ones included.
- `llms.txt` added.
- IndexNow pings run automatically after `npm run deploy`.

**Fixes**
- The OG image works again (the edge runtime was removed).
- The `__name` crash is fixed (`keep_names: false`).
- The "d" hotkey that turned pages white is gone.
- The render-blocking Google Font is removed, and Outfit is trimmed to 5 weights.
- The CSP is tighter and adds `frame-ancestors 'none'`. The `x-powered-by` header is removed, and the Cloudflare analytics beacon is allowed.

**Accessibility**
- Skip link added; the header and footer now sit outside `<main>`.
- Text meets the 4.5:1 contrast minimum everywhere.
- The upload box is keyboard-reachable.
- Results are announced to screen readers.
- The gender button's accessible name matches its visible text.
- Links in legal text are underlined.

**Your decisions, applied**
- Feedback is deleted and returns a 404; /contact is live; /about and /ai stay hidden.
- There are no nav links.
- The blog uses the site blue.
- The gender dropdown defaults to "Any gender".
- The share card is made on the device, and your photo is included only if you opt in.
- Search records are purged after 90 days (`supabase/search_limits.sql`).

## What you still need to do

Everything else is done (SQL files run, facts confirmed, backend deployed). `ollie.ml` is the only domain, and it's hard-coded in `lib/site-config.ts`. A fresh build contains no reference to any other domain.

1. **Commit and deploy the frontend.** Commit the current changes to `dev`, then run `npm run deploy` from `ollie-frontend`. Until then, the live site keeps serving the old build, whose canonical, sitemap, robots.txt and share links point at a domain you don't own. The deploy also pings IndexNow (Bing, Yandex) automatically.
2. **Check the deploy worked.** Open `https://ollie.ml/match` → View Page Source. The canonical should be `https://ollie.ml/match`, and `https://ollie.ml/sitemap.xml` should list only `https://ollie.ml/...` URLs.
3. **Google Search Console:** add a Domain property for `ollie.ml` (verify with the DNS TXT record in Cloudflare), then submit `https://ollie.ml/sitemap.xml`. Use URL Inspection → Request indexing on `https://ollie.ml/match`, because Google was told the page's canonical lived on another domain.
4. **Bing Webmaster Tools:** sign in, import the site from Search Console, and submit the same sitemap. Bing's index also feeds ChatGPT search and Copilot.
5. **Brave Search:** there's nothing to submit, because Brave uses its own crawler. A week or two after deploying, search `site:ollie.ml` on search.brave.com to check it's indexed.
6. **Cloudflare Web Analytics:** a day after deploying, check the dashboard shows visits (the beacon was blocked before). Then watch LCP, INP and CLS for /match over 28 days. Targets at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
7. **Test on a real phone.** On an iPhone and an Android phone, try:
   - a library photo (HEIC on iPhone)
   - Take a selfie
   - a photo with no face
   - a very large photo
   - Share my match, with and without "Include my photo"

**Optional, whenever:**
- If Ollie gets social accounts, add them as `sameAs` in the Organization JSON-LD in `app/layout.tsx`.
- If you want `www.ollie.ml` to redirect to `ollie.ml` (canonicals already point there), add a Cloudflare redirect rule.
- If the contact email changes, update `OWNER.email` in `lib/facts.ts`, `public/llms.txt`, and the privacy and terms pages.

## Next (not done, ranked)

1. **Ship less JavaScript on /match** (the remaining simulated LCP gap). Load the sign-in modal and supabase-js only when needed (`next/dynamic`), and drop framer-motion from the nav and finder where CSS transitions do the job. Remove the unused dependencies listed in `AUDIT.md` (`motion`, `uuid`, `usehooks-ts`, `radix-ui`, `@splinetool/*`).
2. **Consent before upload for guests.** Signup now has checkboxes, but guests upload with only "by uploading you consent". See "Risks".
3. **HEIC on desktop:** Chrome can't decode HEIC when the file is dragged in. iPhones convert automatically when you pick from Photos.
4. **The similarity percentage** is a stretched distance (`scale()` in `celebrity-finder.tsx`). Re-tune `RAW_LO/RAW_HI/OUT_LO` on the celebrity index, because the score range will shift.

## Content roadmap (ideas, not written)

Check each against the existing 90 posts first; some overlap.

1. "Why do lookalike apps give different results?" Explain photo, lighting, dataset and scoring differences. High intent, and it's the most common user question. (Overlaps `why-same-person-different-ai-results`: extend that post rather than duplicating it.)
2. "How Ollie picked 5,000 celebrities": the Wikipedia fame ranking, licensed photos, exclusions and the gender split. This is original, specific and very citable by AI answer engines.
3. "Does lighting really change your face match?" with side-by-side results (use your own photos).
4. "Why celebrities get mistaken for each other": ask the model which celebrities it finds closest to each other. It's original data and shareable.
5. Category roundups ("which actor / singer / athlete do you look like") as a gender and category filter on /match, **not** as thousands of per-celebrity pages. Thin "Who looks like [Celebrity]?" pages would be scaled-content abuse and a right-of-publicity risk.

Off-site ideas for you:
- A "Show HN" for the from-scratch model build.
- Relevant subreddits (r/MachineLearning for the build story, lookalike communities for the app).
- Product Hunt.
- A write-up of the training run.

AI engines trust facts they find repeated across independent sources.

## Risks and flags

Not legal advice.

- **Biometric data:**
  - A face embedding can be biometric data under GDPR (special category), Illinois BIPA, Texas CUBI and Washington's biometric law.
  - BIPA in particular expects **written consent before collection** and a **published retention and destruction policy**, even for brief processing.
  - Ollie discards embeddings immediately. But guests have no explicit consent step, and the policy relies on "by uploading you consent".
  - Consider a one-line consent checkbox above Find my match, or geo-blocking Illinois, before promoting the site in the US.
- **Celebrity photos and names:**
  - Wikimedia Commons licenses cover the photographer's copyright only.
  - They don't cover the person's right of publicity or personality rights. Those vary by country and US state, and the risk rises with commercial use (ads, payments).
  - Credits are shown on every result and on share cards. The site says it isn't affiliated with or endorsed by any celebrity. Keep takedown requests fast (contact page and privacy policy).
- **CC BY-SA thumbnails:** the thumbnails are crops, so credits must say "(cropped)" and link to the license. The share card includes the credit line.
- **Age:** Ollie is 18+ by its terms, but there's no age check for guests. The index contains adults only.
- **Dataset bias:**
  - The celebrity list follows English Wikipedia, so it leans toward US/UK fame, and roughly two-thirds of the people are men.
  - The training data (MS1MV2) is mostly lighter-skinned faces.
  - Both are disclosed on /match. Measure accuracy per group when possible and publish the result.
- **.ml domain:** Mali's ccTLD had years of free-registration spam, and some filters still treat it with suspicion. If Ollie grows, consider moving to a mainstream TLD with 301s and a Search Console change of address.
- **Old claims on hidden pages:** /about and /ai still contain false v1 claims (83% accuracy, 9,131 celebrities, VGGFace2, Siamese). They're hidden and 308 to /match, but rewrite them before ever unhiding them.
