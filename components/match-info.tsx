"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

const SUMMARY = [
  "A facial-recognition convolutional neural network (CNN) trained from scratch on a local GPU over ~10 days, reaching 98.5% accuracy on the Labeled Faces in the Wild (LFW) benchmark.",
  "Built on ~16,000 web-scraped photos of ~2,200 soccer players. Your face is compared against every photo and sorted by similarity.",
  "The same model is being extended to full celebrity look-alike search as well as a tool to find yourself online.",
]

const DETAILS: { title: string; body: string }[] = [
  {
    title: "The model",
    body: "A 20-layer SphereFace CNN written and trained from scratch in PyTorch (no pretrained weights). It detects a face in an image using InsightFace and outputs a 512-number fingerprint. Photos of similar looking people have closer fingerprints, while different people have more distant fingerprints.",
  },
  {
    title: "How it was trained",
    body: "Ollie was trained on the MS1MV2 database which contains around 5.8 million photos of 85,742 people. It was trained locally on an NVIDIA RTX 4060 Ti which took around 10 days for the newest model. It uses the CosFace loss function, which rewards the model for keeping photos of the same person close together and pushing different people far apart, so it learns to tell faces apart. It scored 98.5% on the LFW benchmark, with all the test images removed from the training set so the model never saw them during training.",
  },
  {
    title: "The player database",
    body: "Photos were scraped from image search for ~2,800 player names. A face detector removed non-faces, and an LLM was asked \"is this really <name>?\" about each image to catch search junk. What's left is ~16,000 images of ~2,200 players.",
  },
  {
    title: "What happens when you press the button",
    body: "Your face is detected and aligned, turned into a fingerprint, and compared to every stored photo by distance. Each player is scored by their single closest photo. The percentage comes from that distance, then stretched so the range is easier to read. Trust the ranking more than the exact number, and expect it to move between photos with different lighting or angles.",
  },
  {
    title: "CNN with tweaks vs CNN only",
    body: "\"CNN only\" is the raw model: pure fingerprint distance. \"CNN with tweaks\" (the default) adds a sanity filter that drops players whose typical skin tone is very different from yours, so you don't get a match that clearly looks nothing like you. It only removes candidates. It never changes anyone's score.",
  },
  {
    title: "What's next",
    body: "Extending the same model to a full celebrity look-alike search, and to a tool that lets you find yourself online. The soccer database and the model keep improving as more data is added.",
  },
]

export function MatchInfo() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-20">
      <div className="max-w-3xl mx-auto border-t border-white/5 pt-12">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">How it works</p>
        <ul className="flex flex-col gap-3">
          {SUMMARY.map((line) => (
            <li key={line} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--ollie-cyan)" />
              {line}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-(--ollie-cyan) hover:opacity-80 transition-opacity"
        >
          {open ? "Less info" : "More info"}
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-6 pt-6">
                {DETAILS.map(({ title, body }) => (
                  <div key={title}>
                    <h3 className="text-white/80 text-sm font-bold mb-1.5">{title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
