import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { BGPattern } from "@/components/bg-pattern"

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Ollie handles your photo, your account, your email preferences and the celebrity photo database. Photos you upload are never stored.",
  alternates: { canonical: "/privacy" },
}

const EMAIL = "support@ollie.ml"
const link = "text-(--ollie-cyan) underline underline-offset-2 hover:text-white"

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative min-h-screen bg-transparent">
        <BGPattern variant="grid" mask="fade-edges" fill="rgba(255,255,255,0.04)" size={32} className="fixed" />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Privacy Policy</h1>
          <p className="text-white/60 text-sm mb-12">Last updated: September 24, 2026</p>

          <div className="prose prose-invert max-w-none space-y-10 text-white/60 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
              <p>Ollie (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) compares a photo of your face with photos of well-known celebrities and shows who you look most like. Ollie is run by the Ollie team in British Columbia, Canada, which is responsible for the data described here. This policy explains what data we collect, how we use it, who we share it with, and your rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Your Photo and Face Data</h2>
              <p>When you upload a photo, it is sent through our website to our matching server. There it is used to find your face and turn it into a numerical &quot;fingerprint&quot;, which is compared with the fingerprints of the celebrity photos in our database. <strong className="text-white/80">We do not store, save, log, or retain your photo, your face fingerprint, or your results.</strong> The photo is held in memory only while your search runs and is discarded when it finishes. We do not use your photos to train or improve our model.</p>
              <p className="mt-3">A face fingerprint can count as biometric data under the laws of some places. By uploading a photo you consent to this processing, for the sole purpose of showing you your matches. If you do not consent, please do not upload a photo. Only upload photos of yourself, or of people who have agreed to it.</p>
              <p className="mt-3"><strong className="text-white/80">Gender estimate:</strong> unless you choose &quot;Men&quot; or &quot;Women&quot; in the &quot;Gender&quot; menu, the matching server also estimates from your photo whether the face looks male or female, using the open-source InsightFace model, and uses that estimate only to pick which celebrities to compare you with. The estimate is made in memory, is not stored, and is discarded with your photo. It can be wrong; if you choose &quot;Men&quot; or &quot;Women&quot; instead, no estimate is used.</p>
              <p className="mt-3"><strong className="text-white/80">Share cards:</strong> if you make a card to share your match, it is created entirely in your browser. Nothing is uploaded to us or stored. Your own photo appears on the card next to your match unless you untick "Include my photo". The card only leaves your device if you share it.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Data We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white/80">Account data:</strong> If you create an account, we receive your email address and, if you use Google sign-in, the basic profile details Google shares with us (such as your name). Accounts are managed by our provider Supabase.</li>
                <li><strong className="text-white/80">Your signup choices:</strong> When you sign up, we record that you agreed to our Terms of Service (which require you to be 18 or older) and this Privacy Policy, with the date and the version you agreed to, and whether you chose to receive emails from us.</li>
                <li><strong className="text-white/80">Email list:</strong> Only if you tick the box to receive emails, we keep your email address on our email list with the date you subscribed, and the date you unsubscribe if you do.</li>
                <li><strong className="text-white/80">Search records:</strong> To enforce free-search limits and prevent abuse, we record each search with the time, your account ID (or, for visitors without an account, an identifier derived from your IP address) and your IP address. We do not record the photo or the result. Search records are deleted automatically after 90 days.</li>
                <li><strong className="text-white/80">Website analytics:</strong> We use Cloudflare Web Analytics, which does not use cookies or track you across sites. It records the page you visited, the page that linked you there, your browser and device type, your country, and how fast the page loaded. We also use Google Analytics, which records the pages you visit, how you arrived, your approximate location (from your IP address), your browser and device, and how you use the site, so we can see which pages are useful. We do not use it for advertising.</li>
                <li><strong className="text-white/80">Server logs:</strong> Our hosting provider may log standard technical data (IP address, browser type, pages requested) for security and performance.</li>
                <li><strong className="text-white/80">Cookies and local storage:</strong> We store only what is needed to keep you signed in, plus your signup choices for a moment while you sign in with Google. Google Analytics also sets cookies (named _ga) that recognise a returning browser. In the European Economic Area, the UK and Switzerland these cookies are off, and Google Analytics measures visits without them. We do not use advertising cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. How We Use Your Data</h2>
              <p>We use your data only to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Run the matching service and show you your results</li>
                <li>Manage your account and enforce search limits</li>
                <li>Keep a record of what you agreed to when you signed up</li>
                <li>Send you emails about new Ollie features and updates, only if you opted in</li>
                <li>Protect the service against abuse and security threats</li>
                <li>Understand, in aggregate, which pages are visited and how fast they load</li>
                <li>Respond to your questions and requests</li>
              </ul>
              <p className="mt-3">We do not sell or rent your data, and we do not use it for advertising. We may still send you messages you need to use your account, such as an email to confirm your address, whether or not you joined the email list.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Emails and Unsubscribing</h2>
              <p>Joining the email list is optional and is never pre-selected. If you join, we may send occasional emails about new Ollie features and updates. Every email will include a way to unsubscribe, and you can also unsubscribe at any time by emailing us at <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>. We will act on your request within 10 business days. If we use an email delivery service to send them, it receives your email address only for that purpose.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Who We Share Data With</h2>
              <p>We use these service providers, who process data on our behalf to run the service:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white/80">Modal:</strong> runs our matching server, which briefly handles your photo in memory while it searches.</li>
                <li><strong className="text-white/80">Cloudflare:</strong> hosts the website, delivers pages to you, and provides cookieless website analytics.</li>
                <li><strong className="text-white/80">Supabase:</strong> stores account data, your signup choices, the email list, and search records.</li>
                <li><strong className="text-white/80">Google:</strong> if you choose &quot;Continue with Google&quot;, Google authenticates you and shares your basic profile details with us. We use that information only to sign you in and manage your account. Google also provides Google Analytics (see Website analytics above).</li>
              </ul>
              <p className="mt-3">We may also disclose data if the law requires it.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Where Your Data Is Processed</h2>
              <p>Our providers operate in the United States and other countries, so your data may be processed outside the country where you live. By using Ollie you understand this transfer.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Legal Basis</h2>
              <p>Where privacy law such as the GDPR applies, we process your photo and face data based on your consent (by uploading it), and your email address for our email list based on your consent (by ticking the box). We process account data and your signup choices to provide the service you asked for and to keep a record of your agreement, and search records, logs and website analytics based on our legitimate interest in preventing abuse, keeping the service secure and understanding how the site is used. You can withdraw consent at any time: stop uploading photos (we keep none to delete), or unsubscribe from emails.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. How Long We Keep Data</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white/80">Photos, face fingerprints, gender estimates, and results:</strong> not kept. They are discarded when your search finishes.</li>
                <li><strong className="text-white/80">Account data and signup choices:</strong> kept until you ask us to delete your account.</li>
                <li><strong className="text-white/80">Email list:</strong> kept until you unsubscribe or delete your account. After you unsubscribe we keep only the record that you did, so we don&apos;t email you again.</li>
                <li><strong className="text-white/80">Search records:</strong> deleted automatically after 90 days, or sooner if you ask us to delete your account.</li>
                <li><strong className="text-white/80">Website analytics:</strong> kept by Cloudflare in aggregate form for its standard retention period. Google Analytics keeps visit data for the retention period set in our Google Analytics account (2 months by default).</li>
                <li><strong className="text-white/80">Server logs:</strong> kept by our hosting provider for its standard log period.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. The Celebrity Database</h2>
              <p>Our matching database contains, for well-known living adult public figures:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Photos from <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer" className={link}>Wikimedia Commons</a>, used under their free licenses (such as public domain, CC0, Creative Commons Attribution and Attribution-ShareAlike). Each photo is shown with its photographer and license.</li>
                <li>Numerical face fingerprints computed from those photos.</li>
                <li>Public information from <a href="https://www.wikidata.org/" target="_blank" rel="noopener noreferrer" className={link}>Wikidata</a>: name, a short description of what the person is known for, and gender as recorded there (used only to filter matches by gender), and what the person is best known for (used for the Actors, Singers and Footballers filters). We never estimate a celebrity&apos;s gender from their photos.</li>
              </ul>
              <p className="mt-3">If you are in our database, or you represent someone who is, or you own a photo we show, and you want the data or photo removed, email us at the address below and we will remove it promptly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Age Requirement</h2>
              <p>Ollie is for people aged 18 and over. We do not knowingly collect personal data from anyone under 18. If you believe a child has used Ollie or given us data, contact us and we will delete it promptly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">12. Your Rights</h2>
              <p>Depending on where you live, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct it or request that we delete it (including your account)</li>
                <li>Object to or restrict processing, or withdraw your consent, including unsubscribing from emails</li>
                <li>Receive a copy of your data in a portable format</li>
                <li>Complain to your local data protection authority (in Canada, the Office of the Privacy Commissioner of Canada or the Office of the Information and Privacy Commissioner for British Columbia)</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, email us at the address below. We aim to reply within 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">13. Security</h2>
              <p>We use reasonable technical and organisational measures to protect data, including encrypted connections and limited access: signup choices and the email list can only be read or changed by our server, never by other visitors. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">14. Changes to This Policy</h2>
              <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. If a change affects how we use data you have already given us, we will ask for your consent again where the law requires it.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">15. Contact</h2>
              <p>For privacy questions or requests, contact us at <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
