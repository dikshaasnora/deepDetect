import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

const team = [
  { name: "Krish Lal Srivastava", role: "Lead · Architecture & Backend" },
  { name: "Diksha Asnora", role: "Frontend Developer & Researcher" },
  { name: "Harshit Mehra", role: "Research · Datasets" },
  { name: "Shreya Gupta", role: "Research · Evaluation" },
  { name: "Mr. Abhishek Chaudhary", role: "Faculty Guide" },
]

const milestones: [string, string][] = [
  ["Sep 2025", "Project initiation. Survey of deepfake-detection literature."],
  ["Nov 2025", "First CNN baseline trained on FaceForensics++ — 96.8% accuracy."],
  ["Feb 2026", "Paper I published in IJIRT, Vol. 12, Issue 9 (ISSN 2349-6002)."],
  ["Apr 2026", "Hybrid CNN-Transformer continuation submitted; DeepDetect launched."],
]

export default function About() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-20">
      {/* Intro */}
      <div className="mb-16 max-w-3xl">
        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-accent mb-5">
          About
        </div>
        <h1 className="font-display font-light text-[44px] sm:text-[64px] lg:text-[84px] leading-[0.96] tracking-[-0.035em]">
          Built to ask one <span className="font-italic-display text-accent">simple</span> question.
        </h1>
        <p className="mt-6 text-[16px] sm:text-[17px] leading-relaxed text-ink-soft">
          DeepDetect is a final-year capstone at MGM&rsquo;s College of Engineering &amp; Technology. It pairs a CNN-Transformer
          research model with a hosted vision pipeline to flag AI-generated and manipulated images.
        </p>
        <p className="mt-4 text-[16px] sm:text-[17px] leading-relaxed text-ink-soft">
          Drop in an image — you&rsquo;ll get a verdict, a confidence interval, and a five-axis breakdown of what we saw.
          The tool is designed to <em>name doubt</em>, not certify truth.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper hover:bg-accent transition-colors text-[12px] font-mono uppercase tracking-[0.2em]"
          >
            Open detector <ArrowUpRight className="size-3.5" />
          </Link>
          <Link
            to="/research"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors text-[12px] font-mono uppercase tracking-[0.2em]"
          >
            Read the research
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule mb-16">
        <Stat k="Datasets surveyed" v="04" />
        <Stat k="Architectures evaluated" v="06" />
        <Stat k="Best accuracy" v="97.2%" />
        <Stat k="Inference latency" v="28 ms" />
      </div>

      {/* Team */}
      <div className="border-t border-rule pt-12 mb-16">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-4">
          The team
        </div>
        <h2 className="font-display text-[36px] sm:text-[44px] tracking-[-0.025em] mb-10">
          Five people. One question.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
          {team.map((p) => (
            <div key={p.name} className="bg-paper p-6 hover:bg-paper-deep/60 transition-colors">
              <div className="size-10 rounded-full border border-ink flex items-center justify-center font-mono text-[13px] mb-4">
                {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="font-display text-[20px] leading-tight mb-1">{p.name}</div>
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-muted">{p.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-rule pt-12">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-4">Timeline</div>
        <h2 className="font-display text-[36px] sm:text-[44px] tracking-[-0.025em] mb-8">
          From thesis to <span className="font-italic-display text-accent">terminal</span>.
        </h2>
        <ol>
          {milestones.map(([when, what]) => (
            <li
              key={when}
              className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-4 py-4 border-t border-rule"
            >
              <div className="font-mono text-[12px] text-accent uppercase tracking-[0.16em]">{when}</div>
              <div className="text-[15px] text-ink-soft leading-relaxed">{what}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-paper p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-muted mb-2">{k}</div>
      <div className="font-display text-[32px] sm:text-[40px] leading-none tracking-[-0.02em]">{v}</div>
    </div>
  )
}
