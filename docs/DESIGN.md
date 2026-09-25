# Ollie design rules

The owner chose to **keep the current look** (2026-09-23). This file writes that look down so future edits, human or AI, stay consistent with it. It doesn't propose a new one. If a change isn't covered here, match what /match already does.

## Point of view

Ollie is one person's face-recognition project shown plainly: a black page, white type, one blue, and the result as the only moment of colour and motion. It should read like a lab notebook that happens to be fun, not like a startup landing page.

## Colour

| Token | Value | Use |
|---|---|---|
| background | `#000` (pages), `oklch(0.08 0 0)` (`--ollie-bg`) | every page is dark; there is no light theme |
| text | `#fff` at opacity steps | see contrast floor below |
| blue | `rgb(100 130 210)` / `#6482D2` (`--ollie-cyan`, misnamed, don't rename casually) | the one accent: primary button fill, links, scores, rank, step numbers, focus rings |
| blue glow | `rgb(100 130 210 / 15%)` (`--ollie-glow`) | drag-over state only |
| hairline | `white/10` | panel borders and rows inside a component, never between sections |
| error / warning | red-300 / amber-200 on 10% tints | only for errors and the "no clear face" warning |

- Blue on black is 5.7:1, and black text on blue is 5.7:1. Both pass AA.
- **Never** introduce Tailwind `sky-*`, `cyan-*`, `indigo-*` or any second accent. The blog used `sky-400`; it was brought back to the site blue.

**Contrast floor (WCAG AA):**
- Body text is `text-white/70` (10:1). Secondary text is `text-white/60` (7.4:1).
- Small print never goes below `text-white/50` (5.3:1).
- `white/40` and below are for borders, fills and disabled controls only, never for text someone needs to read.

## Type

- **Outfit** (`next/font`, self-hosted) for everything. Weights in use: 400 body, 500, 600 labels, 700 buttons and sub-headings, 900 headlines and the wordmark. Don't add weights; 300 and 800 are unused.
- JetBrains Mono appears only on hidden pages. Don't use monospace for decorative labels.
- Scale: H1 `text-4xl md:text-5xl font-black tracking-tight`, H2 `text-2xl font-black tracking-tight`, H3 `text-lg font-bold`, body `text-base leading-relaxed`, small `text-sm`.
- Headings get `text-balance` and paragraphs get `text-pretty`. Body columns stay at `max-w-3xl` or narrower (about 70 characters).
- Numbers that compare (scores, counts, steps) use `tabular-nums`.
- Headings are sentence case. The wordmark "OLLIE" is the only tracked-out all-caps text.

## Home, match and contact share one look

Owner's call, 2026-09-24: `/`, `/match` and `/contact` use the same look, so moving between them feels like one site.
- The three.js dotted wave (`components/ui/dotted-surface`) behind the page, hidden under `prefers-reduced-motion`.
- A centred headline that drifts back and fades as you scroll (`data-parallax="near"`). On home the last words are `text-white/50` and blur in (`TextEffect`); on /match and /contact the title is plain white and static (owner's call), and /match keeps its subtitles short so the uploader and results fit on the first screen of a 1366×768 laptop.
- Borderless lit cards from `lib/surfaces.ts` (`card`, or `cardOpen` when the card holds a dropdown menu that must not be clipped), with recessed `bg-black/35` wells inside. No outlined boxes. The match tool uses the see-through `glass` / `glassOpen` version instead, so the dotted background shows through and the tool feels lighter.
- The first screen's cards load in with `animate-in fade-in slide-in-from-bottom-6` (staggered with `delay-150`). Cards further down use `data-reveal` and `RevealOnScroll`.
- On /match the explanations under the finder are tabs (`components/info-tabs.tsx`), not a long scroll. Every panel stays in the server HTML, so crawlers and no-JS visitors still get all of it. `/match#faq` etc. open the matching tab.
- Clicking a nav or footer link to the page you're already on glides back to the top (`components/page-link.tsx`).

## Sizing for every screen

The first screen of home, match and contact must fit the visible height, not just the width, so a short laptop and a tall monitor both look finished.
- The first-screen sections are `min-h-svh` flex columns. Spacing uses `clamp(min, N svh, max)`, and headlines use `.fluid-h1` / `.fluid-h1-sm` (globals.css), which follow `svh` as well as `vw`.
- The flexible part takes the leftover height: the mock window on home (`flex-1` with `min-h`/`max-h`), the uploader and results cards on /match. Nothing from the next section may peek in at the bottom of the first screen.
- Checked at 1280×720, 1366×768, 1536×730, 1098×846, 1920×950 and 2560×1300, plus phones 360 to 390 wide. Only very short phones (about 667px tall) and phones held sideways need a scroll to reach the bottom of the tool.
- Measure a change with headless Chrome at those sizes before shipping it.

## Home page exception

The home page (`/`) keeps the three.js dotted wave (`components/ui/dotted-surface`), the trust strip, and the three step cards. Its hero (owner's call, 2026-09-24) is a large two-tone headline (second half `text-white/50`), `rounded-xl` buttons, and a mock /match window that loops the search loader (`components/ui/progressive-flux-loader`, blue `--ollie-purple` → `--ollie-cyan`). It replaced the particle "OLLIE" canvas. Its sections share the hero's centred axis. Everything else in this file still applies there: text is server-rendered at full opacity, no scroll reveals, the effects respect `prefers-reduced-motion`, and every fact comes from `lib/facts.ts` (no example matches, no made-up stats). Other pages stay on the plain grid look below.

## Layout

- One centred column. The tool sits at `max-w-6xl` (uploader left, results right from `md:` up), and reading content sits at `max-w-3xl`. 24px side gutters (`px-6`).
- Sections are separated by spacing alone (`pt-14`/`mt-16`), with no hairline dividers anywhere, footer included (owner's call, 2026-09-24), and not by boxing each section in a card. Lines only appear inside components: table rows, menus, and the credit/share rows of a result card.
- The page background is the faint grid (`BGPattern`, `fill rgba(255,255,255,0.04)`). There are no other decorative backgrounds, blobs or gradients.

## Components

- **Radius:** `rounded-xl` (12px) for buttons, inputs and thumbnails; `rounded-2xl` (16px) for the drop zone and results panel. Nothing fully rounded except avatars.
- **Buttons:**
  - Primary: solid blue with black bold text; the only one per view is "Find my match".
  - Secondary: blue outline with blue text ("Share my match").
  - Text links: blue with an underline.
- **Focus:** every interactive element shows `outline-2 outline-offset-2 outline-(--ollie-cyan)` on `:focus-visible`.
- **Touch targets:** at least 44px tall for primary actions (`min-h-11`).
- **Results card:** thumbnail, name, what they're known for, score, a thin blue bar and the photo credit. #1 carries the `#1` badge.
- **Shadows:** none, apart from the menus that float over content.
- **Icons:** lucide, inline with text, `aria-hidden`. No icon-in-a-circle decoration.

## Motion

- Motion happens only in response to the user: the result bars grow and the five rows appear one after another. That is the one orchestrated moment.
- Text must paint at full opacity from the server HTML, because it's the LCP. The one exception is the last words of a headline (`TextEffect`), which blur in; on home, match and contact the cards on the first screen also load in (see above).
- No scroll-triggered reveals and no hover lifts.
- Respect `prefers-reduced-motion`.

## Voice

- Plain, specific and first-hand, like the people who built the model explaining it. Never use "I" and never name an individual. Say "Ollie" or "the Ollie team" (owner's rule, 2026-09-24).
- No "Last updated" / "edited" dates in page copy, except on the privacy policy and terms.
- The action is always **Find my match**, and results are always **matches**.
- Banned words: unlock, unleash, seamless, revolutionary, cutting-edge, elevate, "discover the power of", "in today's world", "look no further". Go easy on em dashes.
- Errors say what went wrong and how to fix it. Never invent stats, testimonials, logos or ratings.
- Model facts come from `lib/facts.ts` only. The model is a 20-layer SphereFace-style CNN trained with CosFace. It is **not** a Siamese network.

## Before shipping a UI change

- Ask: would this look the same on any other AI tool's site? If so, cut it or make it specific.
- Remove one decorative thing and see if the page got better.
- Check 375px and 1440px widths, keyboard-only use, and contrast.
