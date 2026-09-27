# Launch posts (drafts)

Drafts for you to post from your own accounts. They're written in the first person because they come from you, not from the site. Read each community's rules the day you post, and reply to comments for the first 2–3 hours. Replies matter more than the post itself. Post one community a day, not all at once.

Facts used (all from `lib/facts.ts`): a 20-layer SphereFace CNN trained from scratch with CosFace loss on MS1MV2 (5.8M photos, 85,742 people), about 10 days on one RTX 4060 Ti, 98.5% on LFW; 5,000+ celebrities and 40,000+ photos from Wikimedia Commons, each credited; the photo is discarded after the search; guests get 5 free searches a day.

---

## 1. Show HN

**When:** Tuesday to Thursday, around 8–10am US Eastern.
**Where:** news.ycombinator.com/submit. Put the URL in the URL field and the text as your first comment.

**Title:**
Show HN: Ollie – a celebrity lookalike finder on a face model I trained from scratch

**URL:** https://www.ollieml.com/match

**First comment:**
> I built Ollie to learn how face recognition works end to end, and ended up training the model myself instead of calling an API.
>
> The model: a 20-layer SphereFace-style CNN trained from scratch with CosFace loss on MS1MV2 (5.8M photos of ~85k people). It took about 10 days on a single RTX 4060 Ti and gets 98.5% on LFW. That's well behind the state of the art (99.8%+), but it was a good lesson in what the last percent costs. Face detection and alignment use InsightFace. The embedding model is my own.
>
> The index: 5,000+ living celebrities ranked by Wikipedia pageviews plus how many language editions cover them, with a regional top-up because English Wikipedia alone skews heavily US/UK. That gives 40,000+ photos, all freely licensed from Wikimedia Commons and credited on every result. Each photo was checked for one clear face, colour, sharpness and identity against the person's own Wikidata photo.
>
> Scoring: each celebrity's score is the mean of their 2 photos closest to yours, so someone with 12 photos doesn't beat someone with 3 just by having more chances.
>
> One fun result: I compared every celebrity with every other one (17M+ pairs). Without any family data, the model put Emperors Akihito and Naruhito, Jonah Hill and Beanie Feldstein, and the chess siblings Praggnanandhaa and Vaishali near the top: https://www.ollieml.com/blog/celebrities-who-look-alike
>
> Known weakness: MS1MV2 is mostly lighter-skinned faces, and it shows. The model separates some groups less finely. That's disclosed on the page.
>
> Your photo is used for the search and then discarded; nothing is stored. Free, with 5 searches a day without an account. Happy to answer anything about the training run.

---

## 2. Reddit: r/MachineLearning

**Flair / tag:** the title must start with `[P]` (Project). Keep it technical, since the sub removes posts that read as ads.

**Title:**
[P] Training a face recognition model from scratch on one consumer GPU (SphereFace + CosFace, 98.5% LFW), and what it found comparing 17M celebrity pairs

**Body:**
> I trained a face embedding model from scratch and put it behind a small celebrity lookalike app, mostly to learn the whole pipeline.
>
> **Setup**
> - 20-layer SphereFace-style CNN, 512-d embeddings, CosFace (large-margin cosine) loss
> - MS1MV2: 5.8M aligned photos of 85,742 identities
> - ~10 days on one RTX 4060 Ti
> - 98.5% on LFW (for comparison, published ResNet-100 + ArcFace setups hit 99.8%)
>
> **Index:** 5,000+ celebrities, 40k+ Wikimedia Commons photos. Each photo passed detection-quality filters (one near-frontal face, colour, sharp) and an identity check against the person's Wikidata photo. People whose reference photos disagreed were skipped, not guessed.
>
> **Scoring:** a person's score is the mean of their top-2 photo similarities to the query. Max-over-photos rewarded people with many photos; the plain mean punished people with one bad photo.
>
> **Pairwise analysis:** I scored all ~17.7M celebrity pairs the same way (screened with mean embeddings, then rescored the closest 3,000 photo by photo). Things that stood out:
> - Relatives came out near the top with no family signal: Akihito/Naruhito, Naruhito/Fumihito, Jonah Hill/Beanie Feldstein, Praggnanandhaa/Vaishali.
> - The people who appeared in the most close pairs were tennis players and K-pop idols, which looks like photo-condition and styling leakage (long-lens sports photos, stage make-up) rather than face similarity.
> - Many of the closest pairs are East/South Asian, which is consistent with MS1MV2's demographic skew. Random pairs sit around 33% on the app's scale, with the 99th percentile at 58%.
>
> Write-up with the pairs: https://www.ollieml.com/blog/celebrities-who-look-alike
> App (free, no account needed for 5 searches): https://www.ollieml.com/match
>
> Happy to go into the training details: LR schedule, margin choice, what didn't work.

*Before posting:* be ready to answer the LR schedule and margin questions with your real numbers from the training logs.

---

## 3. Reddit: r/InternetIsBeautiful

**Rules to check:** no signup walls (true, since guests get 5 free searches), and the title should describe the site. No clickbait.

**Title:**
A free site that finds which of 5,000+ celebrities your face looks most like, and deletes your photo after the search

**Link:** https://www.ollieml.com/match

(No body text: link posts only. If someone asks, reply with the model details from the HN comment.)

---

## 4. Product Hunt

**When:** launch at 12:01am Pacific, and be around all day to reply.

- **Name:** Ollie
- **Tagline (60 chars max):** Find your celebrity lookalike with a from-scratch face AI
- **Link:** https://www.ollieml.com
- **Topics:** Artificial Intelligence, Entertainment, Photography
- **Pricing:** Free
- **Description (260 chars max):**
  > Upload a photo and Ollie compares your face with 5,000+ celebrities, showing your five closest matches and a similarity score. It runs on a face recognition model trained from scratch. Photos are discarded after the search. Free, no account needed.
- **Gallery:** 3–5 screenshots: the /match hero, a result with the runners-up, the share card, /compare, and a chart or quote from the lookalike-pairs post. Use your own face or a friend's (with permission), never a stranger's.
- **Maker's first comment:**
  > Hi Product Hunt! I built Ollie to learn face recognition properly, so the model is my own: a SphereFace-style network trained from scratch on 5.8M photos, about 10 days on one GPU. The celebrity photos are freely licensed from Wikimedia Commons and credited on every result, and your photo is discarded right after the search.
  >
  > One thing I found: when I compared every celebrity with every other one, the AI picked out real families it was never told about, like Emperors Akihito and Naruhito, and Jonah Hill and Beanie Feldstein. Would love your feedback, especially on matches that feel way off.

---

## After posting
- Add any profiles you create (Product Hunt, X, etc.) and I'll put them in the Organization JSON-LD as `sameAs` (`app/layout.tsx`).
- Note the date and the community in this file, so we can match traffic spikes in GA to posts.
