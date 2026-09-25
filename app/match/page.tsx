import type { Metadata } from "next"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { CelebrityFinder } from "@/components/celebrity-finder"
import { InfoTabs, type InfoTab } from "@/components/info-tabs"
import { TextEffect } from "@/components/ui/text-effect"
import { card } from "@/lib/surfaces"
import { INDEX, MODEL, OWNER, SEARCH_LOG_DAYS } from "@/lib/facts"
import { SITE_URL } from "@/lib/site-config"
import { GUEST_LIMIT } from "@/lib/search-quota"
import { RevealOnScroll } from "@/components/reveal-on-scroll"


const DESCRIPTION = `Upload a photo and Ollie's face-recognition model ranks ${INDEX.celebrities} celebrities by how closely they resemble you. Free, and your photo is never stored.`

export const metadata: Metadata = {
  title: "Which Celebrity Do You Look Like? Free AI Face Match",
  description: DESCRIPTION,
  alternates: { canonical: "/match" },
  openGraph: {
    type: "website",
    url: "/match",
    title: "Which celebrity do you look like?",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Which celebrity do you look like?",
    description: DESCRIPTION,
  },
}

const STEPS = [
  [
    "Ollie finds your face.",
    "InsightFace, an open-source face detector, finds the largest face in your photo and lines it up so the eyes and mouth sit in the same place every time.",
  ],
  [
    "The model turns it into numbers.",
    "Ollie's own neural network reads the aligned face and outputs 512 numbers that describe its structure. Photos of the same person land close together, and different people land further apart.",
  ],
  [
    "Celebrities are ranked by closeness.",
    `Those numbers are compared with every photo of ${INDEX.celebrities} celebrities (${INDEX.photosPerPerson} photos each). Each celebrity is scored by their single closest photo, and you see the top five with the photo that matched.`,
  ],
]

const TIPS: { tip: string; href?: string; link?: string }[] = [
  { tip: "Face the camera straight on. A turned head hides half of your face from the model.", href: "/blog/best-photo-celebrity-match", link: "What makes a good photo" },
  { tip: "Use soft, even light, like a window in daytime. Poor lighting hides the structure of your face and shifts its skin tone, and both lower match quality.", href: "/blog/best-lighting-for-match", link: "Lighting guide" },
  { tip: "Take off sunglasses and hats, and keep hair off your face.", href: "/blog/improving-ollie-results", link: "How to improve your results" },
  { tip: "Be the only face in the photo, or the biggest one. Ollie matches the largest face it finds." },
  { tip: "Use a sharp, recent photo without beauty filters. Filters smooth away the details the model measures." },
]

const LIMITS = [
  [
    "The celebrity list follows Wikipedia.",
    "People were picked by how much their English Wikipedia page is read and how many languages cover them, so the list leans toward people famous in English-speaking countries, and roughly two-thirds of the people on it are men. Someone who is a household name in one country may be missing.",
  ],
  [
    "The model learned from an uneven set of faces.",
    "Its training photos (MS1MV2) are mostly of lighter-skinned people, so the model is likely less precise for darker skin tones. It hasn't been measured separately for each group yet.",
  ],
  [
    "The percentage is for comparing, not a verdict.",
    "It comes from the distance between your face's numbers and a celebrity's, stretched onto a 0 to 100 scale so the gaps are easier to read. Compare your five matches with each other. Don't compare scores across different photos, and don't treat them as a probability.",
  ],
  [
    "It's for fun, and for adults.",
    "Everyone in the index is an adult, and Ollie is for people aged 18 and over. It can't tell who someone is, and it shouldn't be used to try.",
  ],
]

const FAQ: [string, string][] = [
  [
    "How accurate is Ollie?",
    `Ollie's face-recognition model scores ${MODEL.lfw} on Labeled Faces in the Wild (LFW), a standard test that asks whether two photos show the same person, and none of the people in LFW were in its training data. Lookalike matching has no right answer, so there's no accuracy figure for it. Your top match is the celebrity whose face the model places closest to yours, and the percentage is only meant for comparing your five results with each other.`,
  ],
  [
    "Is Ollie free?",
    `Yes. You get ${GUEST_LIMIT} free searches without an account. After that, sign in with email or Google to keep searching; accounts are free too. There are no ads and nothing to buy. The limits exist because every search runs a neural network on a paid server.`,
  ],
  [
    "Do you keep my photo?",
    `No. Your photo is held in memory on the matching server only while your search runs, then discarded. It is never saved, logged, shown to anyone, or used to train the model, and neither are the numbers made from your face or your results. Ollie keeps a small record of each search (the time, your account or an IP-based ID, and your IP address) to enforce the free-search limit, and deletes it after ${SEARCH_LOG_DAYS} days.`,
  ],
  [
    "Why do I get different results with different photos?",
    "Because Ollie reads the photo, not you. Lighting, head angle, expression, glasses, distance from the camera and image quality all change how your face looks in pixels, which changes the numbers the model produces. Celebrities near the top often swap places between photos. For the most reliable result, use a sharp, front-facing photo in soft light, and try two or three photos to see who keeps showing up.",
  ],
  [
    "Does it work for women?",
    "Yes. The celebrity index includes women and men, and the model was trained on photos of both. By default Ollie estimates from your photo whether your face looks male or female and compares you with celebrities of that gender, whose gender comes from Wikidata. The estimate can be wrong. To choose yourself, set the Gender menu above Find my match to Men or Women before you search.",
  ],
  [
    "Can I match with only actors, singers or footballers?",
    "Yes. Pick Actors, Singers or Footballers in the Compare with menu before you search. Ollie goes by what each person is best known for on Wikidata, so a singer with one film role counts as a singer. All celebrities is the default.",
  ],
  [
    "Which celebrities are included?",
    `${INDEX.celebrities} of the most famous living adults: actors, musicians, athletes, politicians, business people and online creators. They were chosen by how much their English Wikipedia page was read over six months and how many language editions of Wikipedia cover them. People known mainly for crimes or adult films are left out. Every photo is a freely licensed picture from ${INDEX.source}, credited under your matches.`,
  ],
  [
    "Can I use a group photo?",
    "You can, but Ollie only matches the largest face in the photo. If someone else's face is bigger or closer to the camera, you'll get their matches instead of yours. Crop the photo to just your face first. It takes a few seconds and gives a cleaner result.",
  ],
  [
    "How is Ollie different from other lookalike apps?",
    `The face-recognition model behind Ollie was written and trained from scratch by the Ollie team, instead of calling a commercial face-recognition service. Every celebrity photo is openly licensed and credited, and your photo is never stored. It's a small project, so the celebrity list is smaller than a big company's would be, and its limitations are listed on this page.`,
  ],
]

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ollie",
    url: `${SITE_URL}/match`,
    description: DESCRIPTION,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      `Ranks ${INDEX.celebrities} celebrities by facial similarity`,
      "Top five matches with credited, openly licensed photos",
      "Detects your gender from the photo by default, or lets you pick men or women",
      "Optional filter for actors, singers or footballers",
      "Uploaded photos are never stored",
      "Shareable result image made on your device",
    ],
    creator: { "@type": "Organization", name: "Ollie" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
]

const h2 = "text-2xl font-black text-white tracking-tight text-balance"
const body = "text-white/70 leading-relaxed text-pretty"
const link = "text-(--ollie-cyan) underline underline-offset-4 hover:text-white"

const TABS: InfoTab[] = [
  {
    id: "how",
    label: "How it works",
    content: (
      <>
        <h2 id="how" className={`${h2} scroll-mt-24`}>How Ollie matches your face</h2>
        <ol className="mt-6 space-y-5">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <span className="text-(--ollie-cyan) font-black tabular-nums leading-relaxed">{i + 1}</span>
              <p className={body}>
                <strong className="text-white font-semibold">{title}</strong> {text}
              </p>
            </li>
          ))}
        </ol>
      </>
    ),
  },
  {
    id: "tips",
    label: "Better photos",
    content: (
      <>
        <h2 id="tips" className={h2}>Getting a better match</h2>
        <ul className="mt-6 space-y-4 list-disc pl-5 marker:text-(--ollie-cyan)">
          {TIPS.map(({ tip, href, link: label }) => (
            <li key={tip} className={body}>
              {tip}
              {href && (
                <>
                  {" "}
                  <Link href={href} className={link}>{label}</Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "limits",
    label: "Limitations",
    content: (
      <>
        <h2 id="limits" className={h2}>What Ollie gets wrong</h2>
        <div className="mt-6 space-y-5">
          {LIMITS.map(([title, text]) => (
            <p key={title} className={body}>
              <strong className="text-white font-semibold">{title}</strong> {text}
            </p>
          ))}
          <p className={body}>
            More on reading the percentage: <Link href="/blog/understanding-your-results" className={link}>understanding your results</Link>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "privacy",
    label: "Privacy",
    content: (
      <>
        <h2 id="privacy" className={h2}>What happens to your photo</h2>
        <div className="mt-6 space-y-4">
          <p className={body}>
            Your photo is shrunk in your browser, sent over an encrypted connection to Ollie&apos;s matching server,
            and held in memory for the few seconds the search takes. Then it&apos;s gone. It is never saved, logged,
            or used to train the model, and nobody looks at it.
          </p>
          <p className={body}>
            For each search Ollie records the time, your account (or an ID made from your IP address if you
            aren&apos;t signed in) and your IP address, so the free-search limit works. Those records are deleted
            after {SEARCH_LOG_DAYS}{" "}days. The share image is made on your device and shows your photo next to your
            match; untick &ldquo;Include my photo&rdquo; to leave it off.
          </p>
          <p className={body}>
            The details, including the companies that run the servers, are in the{" "}
            <Link href="/privacy" className={link}>privacy policy</Link>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "faq",
    label: "FAQ",
    content: (
      <>
        <h2 id="faq" className={h2}>Questions</h2>
        <div className="mt-6 space-y-8">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <h3 className="text-lg font-bold text-white text-balance">{q}</h3>
              <p className={`mt-2 ${body}`}>{a}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "model",
    label: "The model",
    content: (
      <>
        <h2 id="model" className={h2}>About the model</h2>
        <p className={`mt-6 ${body}`}>
          The Ollie team wrote and trained Ollie&apos;s face-recognition model from scratch in PyTorch: {MODEL.summary}, on{" "}
          {MODEL.trainingSet}. Training took {MODEL.trainingTime}. It scores {MODEL.lfw}{" "}on the LFW benchmark, with
          every LFW identity removed from the training data first so the test is fair. InsightFace handles finding
          and aligning the face; everything after that is Ollie&apos;s own model.
        </p>
        <p className="mt-6 text-sm text-white/60">
          {OWNER.name}, <Link href="/contact" className={link}>contact</Link>.
        </p>
      </>
    ),
  },
]

export default function MatchPage() {
  return (
    <>
      <DottedSurface className="motion-reduce:hidden" />
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <CelebrityFinder />

        {/* Server-rendered (inside the tabs) so crawlers, AI answer engines and no-JS visitors get the full explanation */}
        <section id="info" aria-labelledby="info-heading" className="relative mx-auto max-w-3xl scroll-mt-20 px-6 pb-24 pt-8">
          <div data-reveal="1">
            <div className="mb-8 text-center">
              <h2 id="info-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight text-balance">
                <TextEffect as="span" per="word" preset="blur" inView>Good to know</TextEffect>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-white/70 text-pretty">
                How Ollie works, what it gets wrong and what happens to your photo.
              </p>
            </div>
            <InfoTabs tabs={TABS} panelClassName={`${card} p-6 md:p-10`} />
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  )
}
