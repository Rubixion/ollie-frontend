"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight, Upload, Star, Brain, Zap, Users,
  MessageSquare, Shield, Check, ChevronRight
} from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { ParticleTextEffect } from "@/components/effects/particle-text"
import { useAuth } from "@/components/auth-provider"
import { FlaskConical } from "lucide-react"

function Divider() {
  return <div className="border-t border-white/5 max-w-6xl mx-auto" />
}

const EXAMPLE_MATCHES = [
  { name: "Ryan Reynolds", pct: 87, label: "Closest match", note: "Jawline angle, eye spacing, nose bridge geometry" },
  { name: "Chris Evans", pct: 74, label: "Strong match", note: "Bone structure and brow line shape" },
  { name: "Henry Cavill", pct: 81, label: "Close match", note: "Facial symmetry and forehead geometry" },
  { name: "Tom Holland", pct: 68, label: "Surprising match", note: "Eye spacing and cheekbone structure" },
]

export default function Page() {
  const { user, openModal } = useAuth()

  return (
    <main className="relative bg-transparent overflow-hidden">
      <DottedSurface />
      <Nav />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col pt-20 pb-10 px-6">
        <h1 className="sr-only">Ollie — Find Your Celebrity Lookalike with AI Face Matching</h1>

        <div className="flex justify-center mb-2">
          <Link
            href="/chemistry"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-white/50 hover:text-white/80 hover:border-white/20 text-xs font-medium transition-all"
          >
            <FlaskConical size={12} className="text-(--ollie-cyan)" aria-hidden="true" />
            Coming soon: Chemistry — try the preview
          </Link>
        </div>

        {/* Main content — centered in remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="w-full mb-6">
              <ParticleTextEffect words={["OLLIE", "FIND YOUR TWIN", "FACE AI", "WHO ARE YOU?"]} />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white/60 text-base md:text-lg max-w-md mx-auto mb-8"
            >
              Upload a photo. Get your closest celebrity matches. Results in under 2 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            >
              <Link
                href="/match"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-(--ollie-cyan) text-black font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-(--ollie-glow)"
              >
                Find Your Lookalike
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold text-sm transition-all"
              >
                Other Projects
              </Link>
            </motion.div>

            {/* Sample result preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="max-w-xs mx-auto"
            >
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 text-left">
                <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest mb-3">
                  Example output
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Users size={17} className="text-white/20" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-sm font-semibold">Ryan Reynolds</span>
                      <span className="text-(--ollie-cyan) text-sm font-black ml-2 shrink-0">87.3%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "87.3%" }}
                        transition={{ delay: 1.3, duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-(--ollie-cyan)"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-white/20 text-[10px] mt-2.5">
                  Matched by: jawline angle, eye spacing, nose bridge geometry
                </p>
              </div>
            </motion.div>

            {!user && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="text-white/20 text-xs mt-5"
              >
                <button
                  onClick={() => openModal()}
                  className="underline underline-offset-2 hover:text-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
                >
                  Create a free account
                </button>
                {" "}to save your results
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Trust strip — always visible within hero viewport */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="w-full max-w-6xl mx-auto mt-8"
        >
          <div
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 rounded-2xl bg-white/[0.02] border border-white/5"
            role="list"
            aria-label="Product guarantees"
          >
            {[
              { icon: Shield, text: "Photos never stored" },
              { icon: Zap, text: "Results in under 2 seconds" },
              { icon: Users, text: "10,177 celebrities" },
              { icon: Brain, text: "Open source model" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2" role="listitem">
                <Icon size={13} className="text-(--ollie-cyan) shrink-0" aria-hidden="true" />
                <span className="text-white/55 text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── DEMO FLOW ────────────────────────────────── */}
      <Divider />
      <section className="px-6 py-24 max-w-6xl mx-auto" aria-labelledby="how-heading">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 id="how-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-white/40 text-base max-w-md">
            Three steps. No signup required for your first result.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              icon: Upload,
              title: "Drop a photo",
              desc: "Any clear face photo. Front-facing works best. Your image stays in your browser until you hit search.",
              visual: (
                <div className="mt-5 rounded-xl border-2 border-dashed border-white/10 px-4 py-5 flex flex-col items-center gap-2">
                  <Upload size={18} className="text-white/15" aria-hidden="true" />
                  <span className="text-white/20 text-xs">Drag and drop or click to browse</span>
                  <span className="text-white/10 text-[10px] font-mono">JPG · PNG · WEBP</span>
                </div>
              ),
            },
            {
              step: "02",
              icon: Brain,
              title: "Ollie reads your face",
              desc: "The model maps 32 measurements — eye spacing, nose geometry, jaw angle — and compresses them to 256 numbers.",
              visual: (
                <div className="mt-5 rounded-xl border border-white/8 px-4 py-4 font-mono text-[10px] text-white/20 leading-loose">
                  <span className="text-(--ollie-cyan)/40">→ </span>eye_dist: 0.412<br />
                  <span className="text-(--ollie-cyan)/40">→ </span>nose_ratio: 0.763<br />
                  <span className="text-(--ollie-cyan)/40">→ </span>jaw_angle: 1.024<br />
                  <span className="text-white/10">···</span> 253 more values
                </div>
              ),
            },
            {
              step: "03",
              icon: Star,
              title: "Get your matches",
              desc: "Your fingerprint is compared against 10,177 celebrities. The five closest are ranked by similarity percentage.",
              visual: (
                <div className="mt-5 rounded-xl border border-white/8 px-4 py-3 flex flex-col gap-2.5">
                  {[["#1", "91.2%"], ["#2", "84.6%"], ["#3", "76.1%"]].map(([rank, pct]) => (
                    <div key={rank} className="flex items-center gap-2">
                      <span className="text-white/20 text-[10px] font-mono w-5 shrink-0">{rank}</span>
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-(--ollie-cyan)/60 text-xs font-bold">{pct}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map(({ step, icon: Icon, title, desc, visual }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-white/[0.025] border border-white/6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                    <Icon size={16} className="text-white/40" aria-hidden="true" />
                  </div>
                  <span className="text-white/15 font-mono text-[11px]">{step}</span>
                </div>
                {i < 2 && (
                  <ChevronRight size={14} className="text-white/10 hidden md:block" aria-hidden="true" />
                )}
              </div>
              <h3 className="text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              {visual}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/match"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-(--ollie-cyan) text-black font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-(--ollie-glow)"
          >
            Try a Photo Now
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* ── EXAMPLES GALLERY ─────────────────────────── */}
      <Divider />
      <section id="examples" className="px-6 py-24 max-w-6xl mx-auto scroll-mt-16" aria-labelledby="examples-heading">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 id="examples-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            What Ollie finds
          </h2>
          <p className="text-white/40 text-base max-w-lg">
            Each result is a ranked list of celebrity faces, scored by how closely your facial geometry aligns with theirs.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXAMPLE_MATCHES.map(({ name, pct, label, note }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white/[0.025] border border-white/6 flex flex-col gap-4 hover:border-white/[0.12] hover:bg-white/[0.035] transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center shrink-0">
                  <Users size={16} className="text-white/20" aria-hidden="true" />
                </div>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-(--ollie-cyan)/15" />
                  <span className="text-(--ollie-cyan) text-xs font-black shrink-0">{pct}%</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-white/5 to-(--ollie-cyan)/15" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-(--ollie-cyan)/8 border border-(--ollie-cyan)/15 flex items-center justify-center shrink-0">
                  <span className="text-(--ollie-cyan) font-black text-sm" aria-hidden="true">
                    {name.charAt(0)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-white font-semibold text-sm">{name}</p>
                <p className="text-white/30 text-xs mt-0.5">{label}</p>
              </div>

              <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                  className="h-full rounded-full bg-(--ollie-cyan)/50"
                />
              </div>

              <p className="text-white/20 text-xs leading-relaxed">{note}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-white/20 text-xs mt-8"
        >
          These are example outputs. Your actual matches depend on your photo and facial geometry.
        </motion.p>
      </section>

      {/* ── THE TECH ─────────────────────────────────── */}
      <Divider />
      <section className="px-6 py-24 max-w-6xl mx-auto" aria-labelledby="tech-heading">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row gap-16 items-start"
        >
          <div className="flex-1">
            <h2 id="tech-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-5">
              Not a wrapper.<br />A real neural network.
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-4">
              Ollie turns your face into 256 numbers. Then it finds which celebrity&apos;s numbers are closest to yours.
            </p>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              That fingerprint is built by a convolutional neural network trained from scratch on millions of faces.
              No off-the-shelf API. No borrowed model. The architecture, training code, and weights are all public.
            </p>
            <Link
              href="/ai"
              className="group inline-flex items-center gap-2 text-white/40 text-sm font-medium hover:text-white/70 transition-colors"
            >
              Full architecture breakdown
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 w-full">
            <div className="rounded-2xl border border-white/6 overflow-hidden">
              {[
                { label: "Dataset", value: "CelebA — 202,599 images across 10,177 celebrities" },
                { label: "Architecture", value: "SphereFaceNet — custom CNN with ArcFace loss" },
                { label: "Accuracy", value: "83.5% on the LFW benchmark" },
                { label: "Fingerprint", value: "256-dimensional face vector per photo" },
                { label: "Match speed", value: "Under 2 seconds end-to-end" },
                { label: "Privacy", value: "Photos processed in memory. Never written to disk." },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={`flex items-start gap-4 px-5 py-4 ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <span className="text-white/25 text-xs font-semibold shrink-0 w-24 pt-0.5">{label}</span>
                  <span className="text-white/60 text-xs leading-relaxed">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEEDBACK ─────────────────────────────────── */}
      <Divider />
      <section className="px-6 py-24 max-w-6xl mx-auto" aria-labelledby="feedback-heading">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start gap-12"
        >
          <div className="flex-1 max-w-lg">
            <h2 id="feedback-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
              Wrong match?<br />Tell Ollie.
            </h2>
            <p className="text-white/55 text-base leading-relaxed mb-3">
              Sometimes Ollie gets it weirdly right. Sometimes it misses completely. Both are useful.
            </p>
            <p className="text-white/35 text-sm leading-relaxed mb-8">
              When you submit a correction, it joins the next training batch. That face pair gets pushed
              further apart in the model. Three days later, the same mistake doesn&apos;t happen again.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/feedback"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/12 text-white/60 hover:text-white hover:border-white/25 font-semibold text-sm transition-all"
              >
                <MessageSquare size={14} aria-hidden="true" />
                Submit a correction
              </Link>
              {!user && (
                <button
                  onClick={() => openModal()}
                  className="text-white/25 text-sm hover:text-white/45 transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
                >
                  Sign up to track submissions
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest mb-4">
                How corrections improve the model
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "You flag a wrong match with your original photo",
                  "It joins the next training batch as a hard negative pair",
                  "The model learns to push those embeddings further apart",
                  "That specific face pair never gets confused again",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={12} className="text-(--ollie-cyan)/50 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-white/45 text-sm leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-2xl font-black text-white mb-0.5">10,177</div>
                <div className="text-white/30 text-xs">celebrities in the dataset</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-2xl font-black text-white mb-0.5">0</div>
                <div className="text-white/30 text-xs">photos stored after your search</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
