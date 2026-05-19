import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowUpRight, Download, FileWarning, Link2, Loader2, Sparkles, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadPdfReport } from "@/lib/pdf"

type Verdict = "AUTHENTIC" | "SYNTHETIC" | "UNCERTAIN"
type Signal = { label: string; status: "clean" | "flagged" | "neutral"; detail: string }
export type Metadata = {
  width?: number
  height?: number
  byteSize?: number
  format?: string
  camera?: string
  lens?: string
  software?: string
  takenAt?: string
  iso?: number
  fNumber?: number
  exposureTime?: string
  focalLength?: number
  gps?: { lat: number; lon: number } | null
  hasExif: boolean
  exifFlags: string[]
}
export type Analysis = {
  verdict: Verdict
  confidence: number
  oneLiner: string
  reasoning: string
  signals: Signal[]
  artifacts: string[]
  recommendation: string
  metadataNote?: string
  metadata?: Metadata
}
type Mode = "file" | "url"

export default function Detect() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<Mode>("file")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [url, setUrl] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Analysis | null>(null)
  const [meta, setMeta] = useState<{ name: string; size?: number } | null>(null)

  const handleFile = useCallback((f: File | null | undefined) => {
    if (!f) return
    if (!f.type.startsWith("image/")) {
      setError("Only image files are supported.")
      return
    }
    setError(null)
    setResult(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMeta({ name: f.name, size: f.size })
    setMode("file")
  }, [])

  const loadFromUrl = useCallback(() => {
    if (!url.trim()) return
    if (!/^https?:\/\//i.test(url.trim())) {
      setError("URL must start with http:// or https://")
      return
    }
    setError(null)
    setResult(null)
    setFile(null)
    setPreview(url.trim())
    setMeta({ name: shortName(url.trim()) })
  }, [url])

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile()
          if (f) handleFile(f)
          return
        }
      }
      const text = e.clipboardData?.getData("text") ?? ""
      if (/^https?:\/\/.+\.(?:png|jpe?g|webp|gif|avif)/i.test(text.trim())) {
        setMode("url")
        setUrl(text.trim())
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [handleFile])

  const reset = () => {
    setFile(null)
    setPreview(null)
    setUrl("")
    setMeta(null)
    setResult(null)
    setError(null)
  }

  const analyze = async () => {
    if (!preview) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const API = import.meta.env.VITE_API_BASE ?? ""
      let res: Response
      if (file) {
        const fd = new FormData()
        fd.append("image", file)
        res = await fetch(`${API}/api/analyze`, { method: "POST", body: fd })
      } else {
        res = await fetch(`${API}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: preview }),
        })
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || `${res.status} ${res.statusText}`)
      }
      const data: Analysis = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e?.message ?? "Analysis failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-20">
      {/* HEADER */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <h1 className="font-display font-light text-[44px] sm:text-[64px] lg:text-[88px] leading-[0.95] tracking-[-0.035em]">
          Real or <span className="font-italic-display text-accent">AI-generated</span>?
        </h1>
        <p className="mt-5 text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
          Upload an image or paste a URL. We&rsquo;ll tell you if it&rsquo;s authentic.
        </p>
      </div>

      {/* TWO COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* INPUT */}
        <div className="lg:col-span-7">
          {/* Mode toggle */}
          <div className="flex border border-rule mb-3 select-none">
            <ModeBtn active={mode === "file"} onClick={() => setMode("file")}>
              <Upload className="size-3.5" /> Upload
            </ModeBtn>
            <ModeBtn active={mode === "url"} onClick={() => setMode("url")}>
              <Link2 className="size-3.5" /> URL
            </ModeBtn>
          </div>

          {mode === "url" && (
            <div className="mb-3 flex border border-rule">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadFromUrl()}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 bg-paper-deep/40 text-[14px] font-mono text-ink placeholder:text-ink-faint focus:outline-none min-w-0"
              />
              <button
                onClick={loadFromUrl}
                className="px-4 sm:px-5 bg-ink text-paper text-[12px] font-mono uppercase tracking-[0.2em] hover:bg-accent transition-colors whitespace-nowrap"
              >
                Load
              </button>
            </div>
          )}

          {/* Drop / preview surface */}
          <div className="relative">
            <div
              onDragOver={(e) => {
                if (mode !== "file" || preview) return
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                if (mode !== "file") return
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files?.[0])
              }}
              onClick={() => !preview && mode === "file" && inputRef.current?.click()}
              className={cn(
                "relative overflow-hidden border bg-paper-deep/40 transition-colors",
                dragOver ? "border-accent bg-paper-deep/80" : "border-rule",
                !preview && mode === "file" && "cursor-pointer hover:border-ink-muted",
                preview && "cursor-default"
              )}
              style={{ aspectRatio: "4 / 3" }}
            >
              {!preview ? (
                <EmptyState mode={mode} />
              ) : (
                <>
                  <img
                    src={preview}
                    alt="Evidence"
                    onError={() => setError("Couldn't load that image. CORS or 404?")}
                    className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-500", loading && "scale-[1.02] saturate-50")}
                  />
                  {loading && <ScanOverlay />}

                  <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-paper">
                    <span className="px-2 py-1 bg-ink/80 backdrop-blur-sm truncate max-w-[60%]">
                      {meta?.name?.slice(0, 40) ?? "remote"}
                    </span>
                    <span className="px-2 py-1 bg-ink/80 backdrop-blur-sm">
                      {file && meta?.size ? `${(meta.size / 1024).toFixed(0)} kB` : mode === "url" ? "url" : ""}
                    </span>
                  </div>
                </>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            {preview && (
              <button
                onClick={reset}
                className="absolute top-3 right-3 sm:top-auto sm:bottom-[-44px] sm:right-0 z-30 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.2em] text-paper sm:text-ink-muted bg-ink/80 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none px-2 py-1 sm:px-0 hover:text-accent transition-colors"
              >
                <X className="size-3" /> clear
              </button>
            )}
          </div>

          {/* Action */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={analyze}
              disabled={!preview || loading}
              className={cn(
                "group inline-flex items-center justify-center gap-3 flex-1 sm:flex-none px-7 py-3.5",
                "bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.22em]",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "enabled:hover:bg-accent transition-colors duration-300"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analysing
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Analyse image
                  <ArrowUpRight className="size-4 transition-transform group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-accent text-[13px] font-mono">
              <FileWarning className="size-4 shrink-0 mt-[2px]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RESULT */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {!result && !loading && <ResultEmpty key="empty" />}
            {loading && <ResultSkeleton key="skel" />}
            {result && <ResultCard key="result" data={result} imageSrc={preview} />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-mono uppercase tracking-[0.2em] transition-colors",
        active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({ mode }: { mode: Mode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
      <div className="size-14 rounded-full border border-rule flex items-center justify-center mb-4 bg-paper">
        {mode === "file" ? <Upload className="size-5 text-ink-muted" /> : <Link2 className="size-5 text-ink-muted" />}
      </div>
      <div className="font-display text-2xl sm:text-[28px] mb-1">
        {mode === "file" ? "Drop an image" : "Paste an image URL"}
      </div>
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-muted">
        {mode === "file" ? "or click to upload — jpg · png · webp" : "press enter to load"}
      </div>
    </div>
  )
}

/* ============================================================
   ANALYSING ANIMATION
   - SVG moving-border (perimeter chase, popular Aceternity pattern)
   - Vertical scan line travelling top → bottom
   - Soft inner ring pulse
   - Cycling axis label
   ============================================================ */
function ScanOverlay() {
  return (
    <>
      {/* Dim wash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-10 bg-ink/30 pointer-events-none"
      />

      {/* Moving border SVG — chase along the inside perimeter */}
      <svg
        className="absolute inset-0 z-20 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="scan-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c2371d" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffb38a" stopOpacity="1" />
            <stop offset="100%" stopColor="#c2371d" stopOpacity="0" />
          </linearGradient>
          <filter id="scan-glow">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        {/* Two chasing dashes 50% offset apart for symmetric "ping-pong" feel */}
        <rect
          x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)"
          fill="none" stroke="url(#scan-grad)" strokeWidth="2"
          pathLength={1} strokeDasharray="0.16 0.84"
          filter="url(#scan-glow)"
        >
          <animate attributeName="stroke-dashoffset" from="1" to="0" dur="2.2s" repeatCount="indefinite" />
        </rect>
        <rect
          x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)"
          fill="none" stroke="#c2371d" strokeWidth="1.2"
          pathLength={1} strokeDasharray="0.12 0.88"
        >
          <animate attributeName="stroke-dashoffset" from="1" to="0" dur="2.2s" repeatCount="indefinite" />
        </rect>
      </svg>

      {/* Soft pulsing inner ring */}
      <motion.div
        className="absolute inset-3 sm:inset-4 z-20 border border-accent/50 pointer-events-none"
        animate={{ opacity: [0.25, 0.7, 0.25] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vertical scan line */}
      <motion.div
        className="absolute inset-x-0 z-20 h-[2px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #ffb38a 50%, transparent)",
          boxShadow: "0 0 18px rgba(194,55,29,0.85), 0 0 36px rgba(194,55,29,0.4)",
        }}
        initial={{ top: "-2px" }}
        animate={{ top: "100%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      />

      {/* Cycling status text at bottom */}
      <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center pointer-events-none">
        <CycleAxis />
      </div>
    </>
  )
}

const AXES = ["LIGHTING", "GEOMETRY", "FREQUENCY", "COMPRESSION", "SEMANTICS"]
function CycleAxis() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % AXES.length), 600)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="px-3 py-1.5 bg-ink/80 backdrop-blur-sm font-mono text-[10px] uppercase tracking-[0.28em] text-paper">
      examining · <span className="text-accent">{AXES[i]}</span>
    </span>
  )
}

function ResultEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border border-dashed border-rule bg-paper-deep/30 p-8 sm:p-10 text-center"
    >
      <div className="font-display text-2xl sm:text-3xl text-ink mb-2 italic">Awaiting an image.</div>
      <p className="text-[13px] text-ink-muted max-w-xs mx-auto leading-relaxed">
        Drop a file or paste a URL on the left, then press Analyse.
      </p>
    </motion.div>
  )
}

function ResultSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border border-rule bg-paper-deep/30 p-6"
    >
      <div className="space-y-4 animate-pulse">
        <div className="h-3 w-24 bg-ink/10" />
        <div className="h-10 w-3/4 bg-ink/10" />
        <div className="h-2 w-full bg-ink/10" />
        <div className="h-2 w-5/6 bg-ink/10" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-12 bg-ink/10" />
          <div className="h-12 bg-ink/10" />
          <div className="h-12 bg-ink/10" />
          <div className="h-12 bg-ink/10" />
        </div>
      </div>
    </motion.div>
  )
}

function ResultCard({ data, imageSrc }: { data: Analysis; imageSrc?: string | null }) {
  const isFake = data.verdict === "SYNTHETIC"
  const isUncertain = data.verdict === "UNCERTAIN"
  const verdictColor = isFake ? "text-accent" : isUncertain ? "text-amber" : "text-ink"
  const headline = isFake ? "Likely AI-generated" : isUncertain ? "Inconclusive" : "Likely authentic"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="border border-rule bg-paper p-6 sm:p-7 shadow-press"
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted">Verdict</div>
      <h2 className={cn("font-display font-light text-[40px] sm:text-[52px] leading-[0.98] tracking-[-0.025em] mt-1", verdictColor)}>
        {headline}
      </h2>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex-1 h-[5px] bg-paper-deep relative overflow-hidden">
          <motion.div
            className={cn("absolute inset-y-0 left-0", isFake ? "bg-accent" : isUncertain ? "bg-amber" : "bg-ink")}
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="font-mono text-xl sm:text-2xl tabular-nums text-ink min-w-[68px] text-right">
          {data.confidence.toFixed(0)}<span className="text-sm text-ink-muted">%</span>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft border-l-2 border-accent pl-4 italic font-display">
        {data.oneLiner}
      </p>

      <div className="mt-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-2">Reasoning</div>
        <p className="text-[14px] leading-relaxed text-ink-soft">{data.reasoning}</p>
      </div>

      <div className="mt-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-2">Signals</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border border-rule">
          {data.signals.map((s, i) => (
            <div key={i} className="bg-paper p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-mono uppercase tracking-[0.16em] text-ink">{s.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-[0.16em] px-1.5 py-0.5",
                    s.status === "flagged" && "bg-accent text-paper",
                    s.status === "clean" && "border border-ink text-ink",
                    s.status === "neutral" && "text-ink-faint"
                  )}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-snug">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {data.artifacts?.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-2">Artifacts spotted</div>
          <ul className="space-y-1.5">
            {data.artifacts.map((a, i) => (
              <li key={i} className="text-[13px] text-ink-soft flex gap-2">
                <span className="text-accent font-mono mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.metadata && <MetadataBlock data={data} />}

      <div className="mt-6 pt-4 border-t border-rule">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted mb-1">Recommendation</div>
        <p className="text-[13.5px] text-ink-soft leading-relaxed">{data.recommendation}</p>
      </div>

      <button
        onClick={() => downloadPdfReport(data, imageSrc)}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors text-[12px] font-mono uppercase tracking-[0.22em]"
      >
        <Download className="size-3.5" /> Download PDF report
      </button>
    </motion.div>
  )
}

function MetadataBlock({ data }: { data: Analysis }) {
  const m = data.metadata!
  const rows: Array<[string, string | undefined | null]> = [
    ["Format", m.format],
    ["Dimensions", m.width && m.height ? `${m.width} × ${m.height} px` : undefined],
    ["Bytes", m.byteSize ? `${(m.byteSize / 1024).toFixed(1)} kB` : undefined],
    ["Camera", m.camera],
    ["Lens", m.lens],
    ["Software", m.software],
    ["Captured", m.takenAt ? new Date(m.takenAt).toLocaleString() : undefined],
    ["ISO", m.iso ? String(m.iso) : undefined],
    ["Aperture", m.fNumber ? `f/${m.fNumber}` : undefined],
    ["Shutter", m.exposureTime],
    ["Focal length", m.focalLength ? `${m.focalLength} mm` : undefined],
    ["GPS", m.gps ? `${m.gps.lat.toFixed(4)}, ${m.gps.lon.toFixed(4)}` : undefined],
  ]
  const present = rows.filter(
    (entry): entry is [string, string] => entry[1] != null && entry[1] !== ""
  )
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted">Image metadata (EXIF)</div>
        <span
          className={cn(
            "text-[10px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5",
            m.hasExif ? "border border-ink text-ink" : "bg-accent text-paper"
          )}
        >
          {m.hasExif ? "present" : "stripped"}
        </span>
      </div>
      {present.length > 0 && (
        <dl className="grid grid-cols-2 gap-px bg-rule border border-rule">
          {present.map(([k, v]) => (
            <div key={k} className="bg-paper px-3 py-2 flex justify-between gap-3">
              <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-muted">{k}</dt>
              <dd className="text-[12px] text-ink text-right truncate">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.metadataNote && (
        <p className="mt-3 text-[13px] text-ink-soft leading-relaxed italic">{data.metadataNote}</p>
      )}
    </div>
  )
}

function shortName(u: string) {
  try {
    const url = new URL(u)
    const last = url.pathname.split("/").pop() || url.hostname
    return last.length > 48 ? last.slice(0, 45) + "…" : last
  } catch {
    return u.slice(0, 48)
  }
}
