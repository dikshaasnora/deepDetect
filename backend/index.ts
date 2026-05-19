import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { analyzeImage, extractMetadata } from "./engine"

const app = new Hono()

app.use("*", logger())

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  ...(process.env.FORENSIQ_FRONTEND_ORIGIN
    ? process.env.FORENSIQ_FRONTEND_ORIGIN.split(",").map((s) => s.trim())
    : []),
]

app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (!origin) return ""
      if (allowedOrigins.includes(origin)) return origin
      // Allow any *.vercel.app preview deployment
      if (/\.vercel\.app$/.test(new URL(origin).hostname)) return origin
      return ""
    },
  })
)

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    model: process.env.FORENSIQ_INFERENCE_MODEL ?? "default",
    keyPresent: Boolean(process.env.FORENSIQ_INFERENCE_KEY),
  })
)

const MAX_BYTES = 8 * 1024 * 1024

app.post("/api/analyze", async (c) => {
  if (!process.env.FORENSIQ_INFERENCE_KEY) {
    return c.json({ error: "Inference key not configured on the server." }, 500)
  }

  try {
    const ct = c.req.header("content-type") ?? ""
    let base64: string
    let mimeType: string

    let buf!: Buffer

    if (ct.includes("application/json")) {
      const { url } = await c.req.json<{ url?: string }>()
      if (!url || !/^https?:\/\//i.test(url)) {
        return c.json({ error: "Provide a valid http(s) image URL." }, 400)
      }
      const fetched = await fetch(url, {
        headers: { "User-Agent": "Forensiq/1.0" },
        redirect: "follow",
      })
      if (!fetched.ok) {
        return c.json({ error: `URL fetch failed (${fetched.status}).` }, 400)
      }
      const ct2 = fetched.headers.get("content-type") ?? ""
      if (!ct2.startsWith("image/")) {
        return c.json({ error: `That URL is not an image.` }, 400)
      }
      const ab = await fetched.arrayBuffer()
      if (ab.byteLength > MAX_BYTES) {
        return c.json({ error: "Remote image exceeds 8 MB limit." }, 413)
      }
      buf = Buffer.from(ab)
      base64 = buf.toString("base64")
      mimeType = (ct2.split(";")[0] ?? "image/jpeg").trim()
    } else {
      const form = await c.req.formData()
      const file = form.get("image")
      if (!(file instanceof File)) {
        return c.json({ error: "Missing 'image' file." }, 400)
      }
      if (!file.type.startsWith("image/")) {
        return c.json({ error: `Unsupported file type: ${file.type}` }, 400)
      }
      if (file.size > MAX_BYTES) {
        return c.json({ error: "Image exceeds 8 MB limit." }, 413)
      }
      buf = Buffer.from(await file.arrayBuffer())
      base64 = buf.toString("base64")
      mimeType = file.type
    }

    const metadata = await extractMetadata(buf, mimeType)
    const result = await analyzeImage({ base64, mimeType, metadata })
    return c.json(result)
  } catch (err: any) {
    console.error("[analyze]", err)
    return c.json({ error: err?.message ?? "Analysis failed." }, 500)
  }
})

const port = Number(process.env.PORT ?? 8787)

export default {
  port,
  fetch: app.fetch,
}

console.log(`▶ Forensiq backend listening on http://localhost:${port}`)
