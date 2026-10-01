# Ollie Style Advisor: build plan

> **Update 2026-09-30.** The owner changed the money model. Everything is free except the AI try-on on your own photo, which is now Ollie Pro: Monthly $6.99 / Yearly $39.99 / Lifetime $79.
> Free users get a 3D try-on instead: a CC0 Quaternius avatar wearing real products.
> This replaces D3 and §6 below. Current status and to-dos are in `../../notes.md` section 1b.

A free live face scan, followed by a quiz and a personal report: the best haircut, grooming and style for the user, plus affiliate product links. It plugs into the existing site next to the celebrity lookalike tool, and the two tools feed each other.

Money comes from affiliate links in every report (free tier included) and from a premium unlock for the features that cost money to run.

---

## 0. Decisions needed before building

| # | Decision | Recommendation |
|---|---|---|
| D1 | **The race question.** Racial or ethnic origin is special-category data under GDPR/UK GDPR, which means explicit consent, extra paperwork, and a large risk if leaked. It's also only a rough proxy for what the advice actually needs. | Replace it with **hair texture** (straight / wavy / curly / coily, with pictures) and an optional **skin-tone swatch picker** (used only for colour palettes). Together these cover everything race was meant to capture, more accurately. If you still want race, make it optional with its own consent tick, and never store it. |
| D2 | **The InsightFace licence.** The buffalo_l weights are published for non-commercial research use only. A paid tier (and ads) makes that a real problem, and it affects the lookalike tool too (TODO.md already flags a lawyer check before making money). | Before launching premium, either buy InsightFace's commercial licence or swap the age/gender estimate for a commercially licensed model. MediaPipe (Apache 2.0) handles everything else in this plan. |
| D3 | **What's free and what's paid.** | Affiliate links stay **free everywhere**, because more reports seen means more clicks. Premium covers things that cost money per use: AI previews of you with each haircut, a longer written "stylist" breakdown, the barber card, saved scans and progress, and the full colour palette. |
| D4 | **Weight vs build.** | Ask for **build** (slim / average / athletic / broad / bigger) rather than weight in kg. It's what the advice needs, and people skip it less. Keep height as a number. |
| D5 | **Minors.** The "look older" goal shouldn't be offered to under-18s. The site should also be 13+ (check the terms). | If the age entered is under 18, hide the "look older" goal. |

---

## 1. User flow

```
/face-shape
 ├─ 1. Intro + consent  "Camera scan runs on your device. Nothing is saved."  [Start scan]
 ├─ 2. LIVE SCAN        camera + cyan landmark mesh overlay, progress ring
 │                      only counts frames where head is straight (|yaw|,|pitch| < 10°)
 │                      ~30 good frames → done.  [Rescan] always visible
 ├─ 3. Scan result      face shape (+ confidence), apparent age, hair read-out
 │                      [Rescan]  [Continue]
 ├─ 4. Quiz (one question per screen, every question skippable)
 │     a. Age (number)            → compared with the scanned age
 │     b. Gender (prefilled from scan, editable) + style direction:
 │        more masculine / more feminine / neutral / softer / sharper
 │     c. Height, build
 │     d. Hair: texture, current length, hairline (full / slight recession / receding / thinning / shaved)
 │     e. Beard?   "Want facial hair?"  yes / maybe / no   → "no" = beard advice never shown
 │     f. Glasses? "Do you wear or want glasses?" yes / open to it / no → "no" = no frame advice
 │     g. Goal: look older / look younger / look sharper / low effort / stand out
 │        (only shown with the age-gap prompt when the gap ≥ 6 yrs; always available as an option)
 │     h. Life: office / creative / trades / student / mix
 │     i. Style picks: tap 2–3 image cards (see §4)
 │     j. Budget per item: £ / ££ / £££
 │     k. Maintenance: barber every 2–3 wks / monthly / rarely
 ├─ 5. Report
 │     Tabs per track:  Working  |  Gen-Z  |  Classic  |  (goal track, e.g. "Look older")
 │     Each: top 3 haircuts (why it fits, barber instructions, styling steps, products)
 │     Grooming routine (skin, hair, beard if opted-in), glasses frames if opted-in
 │     Clothing: fits for build/height + pieces for chosen styles, with product links
 │     "Celebrities with your face shape" (from the Ollie index)
 │     [Share card]  [Rescan]  [Unlock premium]
 └─ 6. Cross-link: "Which celebrity do you look like?" → /match
```

The age-gap prompt is written neutrally, for example: *"The scan reads you as about 21. Want your look to read older, younger, or keep it?"* It never tells anyone they look bad.

---

## 2. Architecture

```
Browser (all on-device)                         Server (existing)                Supabase
───────────────────────                         ──────────────────               ────────
@mediapipe/tasks-vision
  FaceLandmarker (478 pts, pose) ──► overlay canvas (scanner look)
  ImageSegmenter multiclass (hair/skin/clothes)
        │
        ├─► lib/style/measure.ts  → ratios averaged over good frames
        │                          → face shape + confidence (lib/style/face-shape.ts)
        │                          → hair length/volume/forehead read (quiz prefill)
        │
        └─► 1 frame ─────────────► POST /api/style-scan ─► server.py /style-scan
                                    (age, gender only; frame not stored)   (InsightFace genderage, see D2)
quiz answers + measurements
        │
        └─► lib/style/recommend.ts (pure rules, runs in browser, no photo sent)
               uses lib/style/haircuts.ts, lib/style/looks.ts
               products ◄──────────────────────────────────────────────── products table
        report ─► affiliate click ─► /go/[id] (logs click, 302) ─────────► clicks table
```

**Why it's built this way**
- **Nearly everything runs on the device.** Landmarks, segmentation and the recommendations all run in the browser, so only one frame leaves it (for the age estimate). That's cheaper, faster, and much easier to defend legally (§7).
- **Rules, not an LLM, in v1.** The same input always gives the same advice, it costs nothing per scan, and nothing gets invented. The rule tables are written once, offline. An LLM can be added in premium later for the longer "stylist notes" (§6).
- **The scanner is a real feature, not just decoration.** Averaging only the frames where the head is straight is what keeps the face-shape result stable. The progress ring shows it working.
- **Load MediaPipe only after "Start scan" is tapped.** The WASM and models are several MB, and loading them upfront would hurt page speed and SEO.

### Face shape (lib/style/face-shape.ts)
MediaPipe landmark indices (check them against the mesh diagram before relying on them):
- face length: 10 (top of forehead) → 152 (chin)
- forehead width: 54 ↔ 284
- cheekbone width: 234 ↔ 454
- jaw width: 172 ↔ 397
- jaw angle: angle at 172/397 between the cheek and chin points

Classify with simple rules on those ratios: oval / round / square / oblong / heart / diamond / triangle. Return the top two shapes with scores ("Oval, close to oblong"). Point 10 is not the hairline, so don't treat forehead height as exact.

Leave one `face-shape.test.ts` with fixed ratio inputs for each shape.

**Stability check before launch:** take 3 photos each of about 30 people. At least 80% should get the same top shape every time. If not, loosen the thresholds or show "between X and Y" more often.

### Age and gender
- Add `POST /style-scan` to `hf_space/server.py`, reusing the model already loaded there. It returns `{age, gender, gender_conf}` and doesn't save the frame.
- Add `app/api/style-scan/route.ts` as a proxy, following the same pattern as `app/api/search/route.ts`.
- The estimate is roughly ±5 years off, so only use the age gap when it's 6 years or more.

---

## 3. Recommendation engine (lib/style/recommend.ts)

### Haircut catalogue (lib/style/haircuts.ts), ~40–60 entries
```ts
{
  id: "textured-crop",
  name: "Textured crop", aliases: ["french crop"],
  length: "short",
  faceShapes: { good: ["oval","oblong","square","diamond"], ok: ["heart"], avoid: ["round"] },
  hairTypes: ["straight","wavy","curly"],           // hard filter
  hairlineOk: ["full","slight","receding"],          // hard filter
  addsHeight: false,                                  // for short users / tall users
  ageEffect: -1,        // -1 reads younger, 0 neutral, +1 reads older
  direction: 0.5,       // -1 softer/feminine … +1 sharper/masculine
  tracks: ["genz","working"],
  maintenanceWeeks: 3,
  barber: "Skin/low fade #0–#1 sides, 1–1.5\" on top point-cut for texture, short blunt fringe",
  styling: ["Towel dry", "Sea salt spray, blow dry forward", "Pea-size matte clay, twist through"],
  productTags: ["sea-salt-spray","matte-clay","blow-dryer"],
  image: "/style/haircuts/textured-crop.webp"
}
```

### Scoring
```
hard filters: hair texture, hairline, beard/glasses opt-outs, gender direction if set
score = 3·faceShapeFit (good 1 / ok .5 / avoid −1)
      + 2·trackMatch
      + 1.5·goalFit      (look older → +ageEffect, look younger → −ageEffect, sharper → +direction …)
      + 1·heightRule     (short ≤ 170cm: favour addsHeight; tall ≥ 188cm: penalise addsHeight)
      + 1·maintenanceFit
      + 0.5·buildRule    (fuller face read from landmarks / "bigger" build: favour height + tight sides)
→ top 3 per track
```

### Other levers, per goal
| Goal | Levers |
|---|---|
| Look older | shorter sides, structured cuts, beard (**only if opted in**), glasses (**only if opted in**), darker and more tailored clothes, leather shoes |
| Look younger | textured or messy tops, lighter colours, clean-shaven, relaxed fits |
| Sharper / more masculine | fades, defined jaw via beard shaping (if opted in), structured shoulders |
| Softer / more feminine | longer layers, curtain bangs, softer necklines and fabrics |
| Low effort | cuts with 4+ week maintenance, one-product routines |

### Looks and clothing (lib/style/looks.ts)
- Style archetypes with 4–6 key pieces each.
- Fit rules by build and height, for example:
  - short: monochrome, cropped jackets, no oversized
  - tall: layering, wider trousers are fine
  - bigger: structured, darker, vertical lines
- Grooming routines by track (a 3-step skin routine, hair care for each texture, beard care).

The catalogue text gets written once, offline (Claude can draft it; you edit it). It's deterministic after that.

---

## 4. Style picker cards
Clean classic · Old money / smart-casual · Streetwear · Minimal / Scandi · Rugged / workwear · Techwear · Gen-Z (Y2K, soft-boy/girl) · Preppy · Athleisure.

The card images need to be legally usable:
- generated ones (you own them), or
- product images from the affiliate feeds, which the programme terms allow.

**Never** scrape Pinterest or Instagram. The same rule applies to the haircut images.

---

## 5. Products and affiliate links (the main earner)

### Supabase tables
```sql
create table products (
  id text primary key,            -- "amz-clay-001"
  name text not null,
  category text not null,         -- matte-clay, pomade, sea-salt-spray, curl-cream, shampoo, beard-oil,
                                  -- trimmer, cleanser, moisturiser-spf, jacket, shirt, trousers, shoes, frames …
  tags text[] default '{}',       -- hair types, styles, tracks
  price_tier smallint,            -- 1..3
  store text not null,            -- amazon, asos, …
  affiliate_url text not null,
  image_url text,                 -- only from the network's own image source
  active boolean default true,
  last_checked timestamptz
);
create table clicks (
  product_id text references products(id),
  track text, face_shape text,    -- no user id needed; enough for ranking
  at timestamptz default now()
);
```

- **Report picks:** for each haircut or look, match `productTags` to `category`, then filter by budget tier and the user's style tags, then order by past click-through rate. Show 3 products per slot, from at least 2 stores.
- **`/go/[id]`:** a route that logs the click and returns a 302 redirect to `affiliate_url`. Links use `rel="sponsored nofollow"` and open in a new tab. Because product IDs are stable, a changed affiliate URL only needs updating in one place.
- **Programmes to join:**
  - Amazon Associates, which covers grooming, tools and basics
  - Awin, Impact, Rakuten and CJ, which cover most fashion and beauty retailers (apply to each store)
  - Skimlinks or Sovrn as a catch-all at a lower rate
- **Seed catalogue:** about 150 products. At least one per category per budget tier, across texture and style tags.
- **Weekly checker:** a cron job marks dead or out-of-stock links `active=false`.

### Amazon rules
- Don't hard-code Amazon prices. Prices are only allowed from their API and must be kept fresh, so leave them out or pull them live.
- Images must come from Amazon's own image tools.
- Disclosure text, next to the links and in the footer, following the site copy rule (no "I"): *"Ollie earns a commission from some links. As an Amazon Associate, Ollie earns from qualifying purchases."*

---

## 6. Premium (Stripe)

| Feature | Cost driver | Note |
|---|---|---|
| AI previews of you with each top haircut | image-editing model API, per image | Your photo leaves the device, so this needs a separate consent tick. Delete it after generating. |
| Stylist notes (a longer personal breakdown) | LLM call with the measurements and answers (no photo needed) | Can only pick from catalogue IDs, never products it makes up |
| Barber card (image or PDF) | none | Cut name, guard numbers, reference image |
| Saved scans and progress | Supabase row: face shape label and answers only, never landmarks or photos | Needs a login (the auth modal already exists) |
| Full colour palette | none | From the skin-tone swatch and undertone questions |

Start with a one-off unlock, test pricing, and switch to a subscription only if people come back to rescan.

---

## 7. Legal and compliance
- **Biometrics (BIPA, GDPR Art. 9).**
  - Face geometry is calculated in the browser and never sent or stored, which is the strongest position available. Say so plainly on the consent screen and in the privacy policy.
  - The single frame sent for the age estimate is processed in memory and deleted immediately. Disclose this too.
  - Premium previews need a separate, explicit consent.
- **Sensitive answers.** Race (see D1) and build are optional and only held in memory unless the user saves a report. Saved reports hold labels only.
- **Affiliate disclosure.** Covered by the FTC in the US and the CMA/ASA in the UK; see §5 for the text. Don't make claims for products ("clears acne", "anti-ageing") beyond what the store itself says.
- **Minors.** The site is 13+, and "look older" is hidden for under-18s (D5).
- **Update privacy and terms.** Add the camera scan, the age estimate, affiliate links, premium image processing and payments. The legal pages are the only place a "last updated" date is allowed.
- **InsightFace licence** (see D2).

---

## 8. SEO: tying the lookalike tool and the style tool together

**Coordinate with the SEO session (neural-networks-58) before editing shared files** (`app/sitemap.ts`, `lib/facts.ts`, nav/footer, blog files).

### The tool page `/face-shape`
- The URL targets "face shape detector", the strongest keyword for this.
- Title: *"Face Shape Detector & Haircut Finder: Free Live Scan | Ollie"*
- H1: *"Find your face shape, and the haircut that suits it"*
- The tool itself renders in the browser, so the page also needs crawlable text written on the server:
  - how the scan works
  - a guide to the face shapes with example celebrities from the index
  - a FAQ
- Structured data: `WebApplication` (free, category LifestyleApplication), plus an `ItemList` of face shapes.
- Keywords to target (check volumes with OpenSEO before writing):
  - face shape detector / face shape analyzer
  - what haircut suits me / best haircut for my face shape
  - haircut for [shape] face men/women
  - how to look older / younger
  - glasses for [shape] face
  - haircuts for receding hairline, tall guys, short guys

### Blog posts (the blog is already SEO'd; no new landing-page folders, since the category landing pages were deliberately removed)
- 6–7 "Best haircuts for a [shape] face" posts
- "How to look older: haircut, beard and style"
- "Haircuts for a receding hairline"
- "Glasses for your face shape"
- "Haircuts for short / tall guys"
- "Celebrities with a [shape] face", using licensed index photos with credits

Every post embeds a CTA to the tool, and the product links in posts earn affiliate money too.

### The celebrity bridge (the moat)
- **Offline:** run the same face-shape code over the licensed celebrity photos in the index (a new step in `celeb_v2`), and add `face_shape` to each person in `celebs.json` and the index export.
- **/match results:** add *"You and {celeb} both have a square face. See the haircuts that suit it →"* linking to `/face-shape`.
- **/face-shape report:** add *"Celebrities with your face shape"*, using thumbnails and credits the same way /match shows them, plus *"Which one do you look like? →"* linking to `/match`.
- **Share card:** reuse the `share-result.tsx` pattern. *"My face shape: Oval · My best cut: Textured crop · My celeb twin: X"*, where the last part only appears if they've done /match. Each shared card spreads both tools.
- **Other places to link it:** add a card to `components/try-tools.tsx`, and a nav/footer entry. **Don't restyle the home hub** without the user's approval; only add the tool where tools are already listed.

### Performance and SEO hygiene
- Lazy-load MediaPipe after the tap. The page itself should score well in Lighthouse.
- Mark affiliate links `rel="sponsored nofollow"`.
- Add `/face-shape` to the sitemap, and add `/go/*` to the robots.txt disallow list.

---

## 9. UI rules
- Build the stepper, quiz cards, choice chips, buttons, tabs, progress ring and paywall from **21st.dev** components (via the 21st MCP) and adapt them to the site. Don't hand-roll components.
- The landmark overlay is MediaPipe's own `DrawingUtils` drawing onto a canvas, restyled to the single blue `--ollie-cyan` on the existing dark look.
- Follow docs/DESIGN.md and the copy rules: say "the Ollie team", never "I", and don't show "last updated" dates.

---

## 10. Build phases and files

**Phase 1: free MVP**
- `app/face-shape/page.tsx`: server page with the SEO text and schema; loads the client tool
- `components/style-scanner.tsx`: camera, MediaPipe, overlay, progress ring, Rescan
- `components/style-quiz.tsx`: one question per screen, every question skippable
- `components/style-report.tsx`: tracks, haircuts, grooming, clothes, products
- `lib/style/measure.ts`, `face-shape.ts` (+ `face-shape.test.ts`), `recommend.ts`, `haircuts.ts`, `looks.ts`
- `app/api/style-scan/route.ts` and `server.py /style-scan`
- `app/go/[id]/route.ts`, `supabase/style_products.sql` (the products and clicks tables)
- Privacy, terms and affiliate disclosure updates
- New dependency: `@mediapipe/tasks-vision`

**Phase 2: celebrity bridge.** A face-shape step in `celeb_v2`, then `face_shape` added to the export. Add the /match CTA, the "celebrities with your face shape" block and the share card.

**Phase 3: content.** The blog posts from §8 and the product catalogue expanded to 300 or more.

**Phase 4: premium.** Stripe, AI haircut previews, stylist notes, the barber card, saved scans.

**Phase 5: tuning.** Rank products by click-through rate and earnings per click, test different report layouts, and drop products nobody clicks.

### Metrics
- scan started → scan finished → quiz finished → report seen
- affiliate click-through rate per slot, and earnings per 1,000 reports
- how many /match users go to /face-shape, and the reverse
- premium conversion rate
- rescans per user
