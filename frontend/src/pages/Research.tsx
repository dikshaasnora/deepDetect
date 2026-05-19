import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowDownToLine, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { paper1, paper2, type Paper } from "@/data/papers"

const papers = [paper1, paper2]

export default function Research() {
  const [active, setActive] = useState<string>("p1-abstract")

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: "-30% 0px -55% 0px" }
    )
    document.querySelectorAll("section[data-section]").forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-20">
      {/* MASTHEAD */}
      <div className="border-b border-rule pb-8 sm:pb-10 mb-10 sm:mb-12">
        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-accent mb-5">
          Research
        </div>
        <h1 className="font-display font-light text-[44px] sm:text-[64px] lg:text-[84px] leading-[0.96] tracking-[-0.035em]">
          Two papers, one <span className="font-italic-display text-accent">question</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
          Our research on deepfake image detection — first a CNN baseline, then a
          hybrid CNN-Transformer with multimodal fusion. Authored at MGM&rsquo;s
          College of Engineering &amp; Technology.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors text-[11px] font-mono uppercase tracking-[0.18em]">
            <ArrowDownToLine className="size-3.5" /> Download PDF
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-rule text-ink-soft hover:border-ink transition-colors text-[11px] font-mono uppercase tracking-[0.18em]"
          >
            <BookOpen className="size-3.5" /> Try the detector
          </Link>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* TOC — desktop only */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-8">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-4">
              Contents
            </div>
            <nav className="border-l border-rule">
              {papers.map((p, idx) => (
                <div key={p.id} className={idx > 0 ? "mt-6" : ""}>
                  <div className="pl-4 mb-2 text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                    Paper {idx + 1}
                  </div>
                  <ul>
                    {p.sections.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className={cn(
                            "block pl-4 py-1 text-[13px] border-l-[2px] -ml-[1px] transition-colors",
                            active === s.id
                              ? "border-accent text-ink font-medium"
                              : "border-transparent text-ink-muted hover:text-ink"
                          )}
                        >
                          <span className="font-mono text-[10px] text-ink-faint mr-2">
                            {s.numeral}
                          </span>
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* PAPERS */}
        <article className="lg:col-span-9 max-w-[760px] min-w-0">
          {papers.map((p, idx) => (
            <PaperBlock key={p.id} paper={p} index={idx} />
          ))}
        </article>
      </div>
    </section>
  )
}

function PaperBlock({ paper, index }: { paper: Paper; index: number }) {
  return (
    <div className={cn(index > 0 && "mt-20 sm:mt-28 pt-12 sm:pt-16 border-t-2 border-ink")}>
      {/* Title block */}
      <div className="mb-10 sm:mb-12">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-3">
          Paper {index + 1}{paper.subtitle ? ` · ${paper.subtitle}` : ""}
        </div>
        <h2 className="font-display font-light text-[30px] sm:text-[36px] lg:text-[44px] leading-[1.05] tracking-[-0.025em]">
          {paper.title}
        </h2>
        <div className="mt-4 text-[13px] sm:text-[14px] text-ink-soft leading-relaxed">
          {paper.authors.map((a, i) => (
            <span key={i}>
              {a.name}
              <sup className="text-[10px] text-ink-muted">{a.aff}</sup>
              {i < paper.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
        <div className="mt-1 text-[12px] text-ink-muted italic">
          {paper.affiliation}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {paper.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-1 border border-rule text-[10px] font-mono uppercase tracking-[0.18em] text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {paper.sections.map((s) => (
        <motion.section
          key={s.id}
          id={s.id}
          data-section
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-12 scroll-mt-24"
        >
          <div className="flex items-baseline gap-3 sm:gap-4 mb-4 sm:mb-5 pb-2 border-b border-rule">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent shrink-0">
              {s.numeral}
            </span>
            <h3 className="font-display text-[22px] sm:text-[26px] lg:text-[28px] leading-tight tracking-[-0.015em]">
              {s.title}
            </h3>
          </div>
          <div className="space-y-4 sm:space-y-5 text-[14.5px] sm:text-[15.5px] leading-[1.7] sm:leading-[1.75] text-ink-soft">
            {s.body.map((node, i) => renderNode(node, i))}
          </div>
        </motion.section>
      ))}
    </div>
  )
}

function renderNode(node: any, key: number): any {
  if (typeof node === "string") {
    return (
      <p
        key={key}
        className="[&_strong]:text-ink [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: node }}
      />
    )
  }
  if (node.type === "callout") {
    return (
      <div
        key={key}
        className="my-6 border-l-2 border-accent bg-paper-deep/40 px-4 sm:px-5 py-4 text-[14px]"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-1">
          {node.label}
        </div>
        <div className="text-ink-soft leading-relaxed font-display italic text-[16px] sm:text-[18px]">
          {node.text}
        </div>
      </div>
    )
  }
  if (node.type === "table") {
    return (
      <figure key={key} className="my-8 -mx-5 sm:mx-0">
        <div className="overflow-x-auto border-y sm:border border-rule">
          <table className="w-full min-w-[520px] text-[12px] sm:text-[13px] font-mono">
            <thead>
              <tr className="bg-ink text-paper">
                {node.headers.map((h: string, i: number) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left uppercase tracking-[0.14em] text-[10px] font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {node.rows.map((row: any[], ri: number) => (
                <tr
                  key={ri}
                  className={cn(
                    "border-t border-rule",
                    row[0]?.startsWith?.("**") && "bg-accent/8"
                  )}
                >
                  {row.map((c: any, ci: number) => (
                    <td
                      key={ci}
                      className={cn(
                        "px-3 py-2.5 align-top",
                        ci === 0 && "text-ink",
                        typeof c === "string" && c.startsWith("**") && "text-accent font-semibold"
                      )}
                      dangerouslySetInnerHTML={{
                        __html: typeof c === "string" ? c.replace(/\*\*/g, "") : String(c),
                      }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {node.caption && (
          <figcaption className="mt-2 px-5 sm:px-0 text-[11px] font-mono uppercase tracking-[0.18em] text-ink-muted text-center">
            {node.caption}
          </figcaption>
        )}
      </figure>
    )
  }
  if (node.type === "refs") {
    return (
      <ol
        key={key}
        className="space-y-2.5 text-[12.5px] sm:text-[13px] text-ink-muted leading-relaxed list-none"
      >
        {node.items.map((r: string, i: number) => (
          <li key={i} className="grid grid-cols-[28px_1fr] gap-2">
            <span className="font-mono text-accent text-[11px] pt-0.5">
              [{String(i + 1).padStart(2, "0")}]
            </span>
            <span dangerouslySetInnerHTML={{ __html: r }} />
          </li>
        ))}
      </ol>
    )
  }
  return null
}
