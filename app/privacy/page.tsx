import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy",
  description: "Ollie privacy policy. Learn how we handle your data and images.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: September 2026</p>

        <div className="prose prose-invert max-w-none space-y-10 text-white/60 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
            <p>Ollie (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a tool that compares a photo of your face with photos of soccer players and shows who you look most like. Ollie is run by its creator in British Columbia, Canada, who is responsible for the data described here. This policy explains what data we collect, how we use it, who we share it with, and your rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Your Photo and Face Data</h2>
            <p>When you upload a photo, it is sent through our website to our matching server. There it is used to find your face, turn it into a numerical &quot;fingerprint&quot;, and measure a few facial features (such as skin tone), which are compared against our database of soccer players. <strong className="text-white/80">We do not store, save, log, or retain your photo, your face fingerprint, or your results.</strong> The photo is held in memory only while your search runs and is discarded when it finishes. We do not use your photos to train or improve our model.</p>
            <p className="mt-3">A face fingerprint can count as biometric data under the laws of some places. By uploading a photo you consent to this processing, for the sole purpose of showing you your matches. If you do not consent, please do not upload a photo. Only upload photos of yourself, or of people who have agreed to it.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/80">Account data:</strong> If you sign in, we receive your email address and, if you use Google sign-in, the basic profile details Google shares with us (such as your name). Your accounts are managed by our provider Supabase.</li>
              <li><strong className="text-white/80">Search records:</strong> To enforce free-search limits and prevent abuse, we record each search with the time, your account ID (or, for visitors without an account, an identifier derived from your IP address) and your IP address. We do not record the photo or the result.</li>
              <li><strong className="text-white/80">Server logs:</strong> Our hosting provider may log standard technical data (IP address, browser type, pages requested) for security and performance.</li>
              <li><strong className="text-white/80">Cookies and local storage:</strong> We store only what is needed to keep you signed in. We do not use advertising or tracking cookies, and we do not use third-party analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. How We Use Your Data</h2>
            <p>We use your data only to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Run the matching service and show you your results</li>
              <li>Manage your account and enforce search limits</li>
              <li>Protect the service against abuse and security threats</li>
              <li>Respond to your questions and requests</li>
            </ul>
            <p className="mt-3">We do not sell or rent your data, and we do not use it for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Who We Share Data With</h2>
            <p>We use these service providers, who process data on our behalf to run the service:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/80">Modal:</strong> runs our matching server, which briefly handles your photo in memory while it searches.</li>
              <li><strong className="text-white/80">Cloudflare:</strong> hosts the website and delivers pages to you.</li>
              <li><strong className="text-white/80">Supabase:</strong> stores account data and search records.</li>
              <li><strong className="text-white/80">Google:</strong> if you choose &quot;Continue with Google&quot;, Google authenticates you and shares your basic profile details with us. We use that information only to sign you in and manage your account.</li>
            </ul>
            <p className="mt-3">We may also disclose data if the law requires it.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Where Your Data Is Processed</h2>
            <p>Our providers operate in the United States and other countries, so your data may be processed outside the country where you live. By using Ollie you understand this transfer.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Legal Basis</h2>
            <p>Where privacy law such as the GDPR applies, we process your photo and face data based on your consent (by uploading it). We process account data to provide the service you asked for, and search records and logs based on our legitimate interest in preventing abuse and keeping the service secure. You can withdraw consent at any time by not uploading further photos; because we do not keep your photos, there is nothing further to delete.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. How Long We Keep Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/80">Photos, face fingerprints, and results:</strong> not kept. They are discarded when your search finishes.</li>
              <li><strong className="text-white/80">Account data:</strong> kept until you ask us to delete your account.</li>
              <li><strong className="text-white/80">Search records:</strong> kept for as long as needed to enforce search limits and prevent abuse, and deleted when you ask us to delete your account.</li>
              <li><strong className="text-white/80">Server logs:</strong> kept by our hosting provider for its standard log period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. The Player Database</h2>
            <p>Our matching database contains numerical face fingerprints and thumbnails derived from publicly available photos of professional soccer players. If you are a player, or you own or represent one, and you want your data or images removed, email us at the address below and we will remove them promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Age Requirement</h2>
            <p>Ollie is for people aged 18 and over. We do not knowingly collect personal data from anyone under 18. If you believe a child has used Ollie or given us data, contact us and we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Your Rights</h2>
            <p>Depending on where you live, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct it or request that we delete it (including your account)</li>
              <li>Object to or restrict processing, or withdraw your consent</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>Complain to your local data protection authority (in Canada, the Office of the Privacy Commissioner of Canada or the Office of the Information and Privacy Commissioner for British Columbia)</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at the address below. We aim to reply within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Security</h2>
            <p>We use reasonable technical and organisational measures to protect data, including encrypted connections and limited access. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of Ollie after changes means you accept them.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Contact</h2>
            <p>For privacy questions or requests, contact us at <a href="mailto:lbrad@student.ubc.ca" className="text-sky-400 hover:underline">lbrad@student.ubc.ca</a>.</p>
          </section>

        </div>
      </div>
      <Footer />
    </main>
  )
}
