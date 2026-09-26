# GEO Analysis: ollie.ml (2026-09-26)

Source: Google Search Console (`sc-domain:ollie.ml`) plus live HTML fetched as GPTBot.

## GEO readiness score: 72/100 (on-page). Real visibility right now: 0

| Area | Score | Notes |
|---|---|---|
| Citability | 20/25 | /match and blog posts have direct, fact-dense answers (98.5% LFW, 5,000+ celebrities, 512-number embedding) |
| Structure | 17/20 | Question-style H1/H2s, FAQ blocks, short paragraphs |
| Multi-modal | 10/15 | Diagrams in the HTML; no video, no example result images |
| Authority / brand | 7/20 | Author is "Ollie Research Team" (Organization), no `sameAs`, no presence found on other sites |
| Technical | 18/20 | Server-rendered, all crawlers allowed, canonicals set, apex 301 to www, llms.txt present, IndexNow runs on deploy |

Platform view: Google AI Overviews ≈ 0 (pages not indexed). ChatGPT, Copilot and Perplexity ≈ low (IndexNow feeds Bing, but no third-party mentions).

## Search Console findings

- **0 impressions in 90 days.** The property only has data from 2026-09-23.
- **Only the homepage is indexed** (`https://www.ollie.ml/`, crawled 2026-09-26).
- **/match: "Crawled - currently not indexed".** This is the money page.
- **/blog and all 90 posts: "URL is unknown to Google".**
- **Sitemap was never downloaded** (`last_downloaded: null`). Resubmitted on 2026-09-26 at 06:09, status pending.

AI Overviews cite pages from Google's index, so until these pages are indexed, content tweaks do nothing for Google.

## Top 5 highest-impact changes

1. **Get pages indexed (done in part).** Sitemap resubmitted. In the GSC UI, use URL Inspection → *Request indexing* for /match, /blog and the 6 "Best guides" posts. The API can't do this.
2. **Make /match clearly different from the homepage.** Both target "celebrity lookalike", and Google indexed home and skipped /match. Keep home as the brand/overview page ("Ollie, free celebrity lookalike app") and let /match own "what celebrity do I look like". Add a second, prominent link from the homepage body to /match (the homepage body currently has one).
3. **Add `sameAs` to the Organization schema** once the profiles exist (GitHub repo for the model, Reddit, YouTube, Product Hunt, LinkedIn). Brand mentions correlate with AI citations much more than backlinks do.
4. **Earn off-site mentions.** Post the "trained from scratch, 98.5% LFW" story on r/MachineLearning or r/SideProject, write a Hacker News "Show HN", and make a short YouTube demo. ChatGPT and Perplexity lean heavily on Reddit and YouTube.
5. **Add named human authors** to the technical posts (Person schema with a short bio or credentials) in place of, or alongside, "Ollie Research Team".

## Schema

- Present: Organization, WebSite, WebApplication + Offer, FAQPage, BlogPosting, BreadcrumbList.
- Add: `sameAs` on Organization. Add `dateModified` to the /match WebApplication. Add Person authors on BlogPosting.

## Content suggestions

- /match "About the model": open with one self-contained answer of about 150 words, for example "Ollie is a free celebrity lookalike finder that…", covering the model, the dataset, the 98.5% LFW score and privacy, so an AI can quote it whole.
- Homepage: 354 words is fine for a brand page. Don't pad it; the extra depth belongs on /match.
- Add one or two example result images (a consented or stock face → top-5 grid) to /match.

## No action needed

- robots.txt allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot. Keep it that way for GEO.
- llms.txt is good, but Google says it has no ranking weight. Leave it as is.
- The `.ml` TLD has a spam history (old Freenom domains), which can slow down trust for a new site. Expect indexing to take weeks, not days.
