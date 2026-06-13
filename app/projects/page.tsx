import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowRight, Users, Search, Map, MessageSquare, Star, Zap, Brain } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { BGPattern } from "@/components/bg-pattern"

export const metadata = {
  title: "Projects",
  description: "Everything being built — ML-powered tools and standalone projects.",
}

type Status = "live" | "coming-soon"

interface Project {
  name: string
  tagline: string
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>
  desc: string
  status: Status
  href: string | null
}

const ML_PROJECTS: Project[] = [
  {
    name: "Match",
    tagline: "Celebrity face matching",
    icon: Users,
    desc: "Upload a photo and get five ranked celebrity matches based on facial geometry. Each face is compressed to a 256-dimensional embedding, then compared against 10,177 celebrities from CelebA.",
    status: "live",
    href: "/match",
  },
  {
    name: "Search",
    tagline: "Internet-scale face search",
    icon: Search,
    desc: "Search for a person by face across a broader public index. Upload any photo and the model finds who matches — beyond just celebrities.",
    status: "live",
    href: "/search",
  },
  {
    name: "Maps",
    tagline: "Face similarity map",
    icon: Map,
    desc: "Visualize the celebrity embedding space as an interactive map. See how faces cluster by structure — and where your own face lands among them.",
    status: "coming-soon",
    href: null,
  },
  {
    name: "Feedback",
    tagline: "Improve the model",
    icon: MessageSquare,
    desc: "Submit a correction when a match is wrong. Every flagged result is added to the next training batch as a hard negative pair, making the model more accurate for everyone.",
    status: "live",
    href: "/feedback",
  },
  {
    name: "How It Works",
    tagline: "Architecture and benchmarks",
    icon: Brain,
    desc: "A full breakdown of the SphereFaceNet architecture, ArcFace loss function, training data, and accuracy results on LFW and other standard benchmarks.",
    status: "live",
    href: "/ai",
  },
]

const OTHER_PROJECTS: Project[] = [
  {
    name: "Chemical Calculator",
    tagline: "Chemistry tools",
    icon: Zap,
    desc: "Molar mass, reaction balancing, concentration calculations, and more. A full-featured chemistry calculator built for students and researchers. No login, no ads.",
    status: "coming-soon",
    href: null,
  },
  {
    name: "Mind Portal",
    tagline: "Mental clarity tool",
    icon: Star,
    desc: "A focused environment for organising thoughts, building habits, and working through problems clearly. No social features, no distractions.",
    status: "coming-soon",
    href: null,
  },
  {
    name: "AI Folder Search",
    tagline: "Search files with natural language",
    icon: Search,
    desc: "Describe what you're looking for in plain English and find it across your file system. Not a keyword search — a semantic one that understands context.",
    status: "coming-soon",
    href: null,
  },
]

function StatusBadge({ status }: { status: Status }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--ollie-cyan)/10 border border-(--ollie-cyan)/20 text-[10px] font-bold text-(--ollie-cyan) uppercase tracking-wider shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-(--ollie-cyan)" aria-hidden="true" />
        Live
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] font-bold text-white/25 uppercase tracking-wider shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-white/15" aria-hidden="true" />
      Soon
    </span>
  )
}

function ProjectCard({ name, tagline, icon: Icon, desc, status, href }: Project) {
  const isLive = status === "live"

  const card = (
    <div
      className={`group flex flex-col gap-4 p-6 rounded-2xl border h-full transition-all ${
        isLive
          ? "bg-white/[0.025] border-white/8 hover:border-white/[0.18] hover:bg-white/[0.04]"
          : "bg-white/[0.01] border-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
          isLive ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5"
        }`}>
          <Icon size={16} className={isLive ? "text-white/50" : "text-white/20"} aria-hidden={true} />
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex-1">
        <p className={`font-black text-lg tracking-tight mb-0.5 ${isLive ? "text-white" : "text-white/35"}`}>
          {name}
        </p>
        <p className="text-white/20 text-xs font-medium mb-3">{tagline}</p>
        <p className={`text-xs leading-relaxed ${isLive ? "text-white/45" : "text-white/20"}`}>
          {desc}
        </p>
      </div>

      {isLive && (
        <div className="flex items-center gap-1.5 text-white/30 text-xs font-semibold group-hover:text-white/60 transition-colors">
          Open
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </div>
      )}
    </div>
  )

  if (isLive && href) {
    return (
      <Link href={href} className="block h-full" aria-label={`Open ${name}`}>
        {card}
      </Link>
    )
  }

  return <div className="h-full">{card}</div>
}

function SectionHeader({ id, label, description }: { id: string; label: string; description: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <h2 id={id} className="text-xs font-bold text-white/40 uppercase tracking-widest shrink-0">
          {label}
        </h2>
        <div className="flex-1 h-px bg-white/5" aria-hidden="true" />
      </div>
      <p className="text-white/25 text-sm max-w-xl leading-relaxed">{description}</p>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <main className="relative bg-transparent">
      <BGPattern variant="dots" mask="fade-edges" fill="rgba(255,255,255,0.025)" size={24} className="fixed" />
      <Nav />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Projects
          </h1>
          <p className="text-white/35 text-base max-w-lg leading-relaxed">
            Some use the face model. Some are entirely separate. All are built in the open.
          </p>
        </div>

        {/* ML section */}
        <section aria-labelledby="ml-heading" className="mb-20">
          <SectionHeader
            id="ml-heading"
            label="Ollie's model"
            description="These tools are all powered by the same SphereFaceNet — a convolutional neural network that converts any face into a 256-dimensional embedding."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ML_PROJECTS.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </section>

        <div className="border-t border-white/5 mb-20" aria-hidden="true" />

        {/* Non-ML section */}
        <section aria-labelledby="other-heading">
          <SectionHeader
            id="other-heading"
            label="Unrelated"
            description="Standalone tools that solve different problems. No neural networks involved."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OTHER_PROJECTS.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
