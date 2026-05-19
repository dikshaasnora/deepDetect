/**
 * DeepDetect inference layer.
 * Extracts image metadata, applies the forensic-examiner prompt to a multimodal
 * model, and coerces the response into a strict JSON schema.
 */
import exifr from "exifr"

const DEFAULT_MODEL = process.env.FORENSIQ_INFERENCE_MODEL ?? "gemini-2.5-flash"

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

export async function extractMetadata(buf: Buffer, mimeType: string): Promise<Metadata> {
  const meta: Metadata = {
    byteSize: buf.byteLength,
    format: mimeType.split("/")[1]?.toUpperCase(),
    hasExif: false,
    exifFlags: [],
  }

  try {
    const exif: any = await exifr.parse(buf, {
      gps: true,
      pick: [
        "Make",
        "Model",
        "LensModel",
        "Software",
        "DateTimeOriginal",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "ImageWidth",
        "ImageHeight",
        "ExifImageWidth",
        "ExifImageHeight",
        "latitude",
        "longitude",
      ],
    })

    if (exif) {
      meta.hasExif = true
      meta.width = exif.ExifImageWidth ?? exif.ImageWidth
      meta.height = exif.ExifImageHeight ?? exif.ImageHeight
      meta.camera = [exif.Make, exif.Model].filter(Boolean).join(" ") || undefined
      meta.lens = exif.LensModel
      meta.software = exif.Software
      meta.takenAt = exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : undefined
      meta.iso = exif.ISO
      meta.fNumber = exif.FNumber
      meta.exposureTime =
        typeof exif.ExposureTime === "number"
          ? exif.ExposureTime >= 1
            ? `${exif.ExposureTime}s`
            : `1/${Math.round(1 / exif.ExposureTime)}s`
          : undefined
      meta.focalLength = exif.FocalLength
      meta.gps =
        typeof exif.latitude === "number" && typeof exif.longitude === "number"
          ? { lat: exif.latitude, lon: exif.longitude }
          : null

      // Heuristic flags an examiner would look for
      if (meta.software && /stable diffusion|midjourney|dall-?e|photoshop|firefly|krita|gimp/i.test(meta.software)) {
        meta.exifFlags.push(`software-tag:${meta.software}`)
      }
      if (!meta.camera) meta.exifFlags.push("no-camera-make")
      if (!meta.takenAt) meta.exifFlags.push("no-capture-date")
    } else {
      meta.exifFlags.push("no-exif")
    }
  } catch {
    meta.exifFlags.push("exif-parse-error")
  }

  return meta
}

const PROMPT = `You are FORENSIQ, an expert forensic image examiner with deep familiarity with modern generative models (Stable Diffusion, Midjourney, DALL-E, FLUX, GANs, face-swap deepfakes, in-painting tools).

TASK
Classify the supplied image as one of:
  • SYNTHETIC — clearly AI-generated, deepfaked, or substantially manipulated.
  • AUTHENTIC — genuine unedited photograph (or trivial colour/crop edits only).
  • UNCERTAIN — only when signals genuinely conflict, the image is too low-resolution to assess, or it contains no semantic content (e.g. solid colour, plain texture).

BE DECISIVE. Modern AI images are often very polished — do not let polish fool you. If you see strong tells, commit to SYNTHETIC with high confidence (80-99). If it's a normal photo with no red flags, commit to AUTHENTIC (75-95). UNCERTAIN should be rare.

KEY TELLS FOR SYNTHETIC IMAGERY (any one is significant; multiple are conclusive):
  • Skin/texture: airbrushed, plastic, too-uniform pores; hair strands that merge or terminate impossibly.
  • Eyes: mismatched gaze direction, oddly-shaped pupils, asymmetric reflections, "doll" sheen.
  • Hands & fingers: wrong count, fused/extra digits, impossible joints, watch-on-wrong-wrist.
  • Teeth: incorrect count, fused, glassy.
  • Ears, jewellery, glasses: asymmetric where they should match, frame mismatches.
  • Text in background: garbled, melted, or mirror-flipped letters.
  • Lighting & shadows: shadow direction inconsistent across subjects, soft "studio" lighting on outdoor scenes, no contact shadows.
  • Backgrounds: melted geometry, warped architecture, repeating textures, depth-of-field that doesn't match optics.
  • Composition: subject perfectly centered with idealised symmetry; impossibly clean bokeh; "concept-art" lighting.
  • Anachronisms / impossible scenes: animals in human gear, surreal juxtapositions (e.g. cat in astronaut suit), fictional creatures rendered photo-real — almost always SYNTHETIC.
  • Artifact patterns: GAN-grid hatching, diffusion noise residue, frequency-domain checkerboarding.

KEY TELLS FOR AUTHENTIC IMAGERY:
  • Naturalistic imperfections — skin pores, blemishes, asymmetric hair, slight motion blur.
  • Consistent EXIF-style noise floor across the frame.
  • Lighting that obeys a single physical scene; correct contact and cast shadows.
  • Background plausibility — readable text, coherent architecture, plausible bokeh from a real lens.
  • Subject candid or imperfect framing.

OUTPUT — STRICT JSON ONLY, matching this schema EXACTLY (no markdown fences, no commentary):
{
  "verdict": "AUTHENTIC" | "SYNTHETIC" | "UNCERTAIN",
  "confidence": number,                  // 0-100, calibrated to your true belief
  "oneLiner": string,                    // 1 sentence, plain English, no jargon
  "reasoning": string,                   // 3-5 sentences a non-expert can follow
  "signals": [                           // EXACTLY 5 entries, in this exact order
    { "label": "Lighting",    "status": "clean" | "flagged" | "neutral", "detail": short string },
    { "label": "Geometry",    "status": "clean" | "flagged" | "neutral", "detail": short string },
    { "label": "Frequency",   "status": "clean" | "flagged" | "neutral", "detail": short string },
    { "label": "Compression", "status": "clean" | "flagged" | "neutral", "detail": short string },
    { "label": "Semantics",   "status": "clean" | "flagged" | "neutral", "detail": short string }
  ],
  "artifacts": string[],                 // 0-5 SPECIFIC tells you spotted; concrete language ("six fingers on the left hand"); empty array if none
  "recommendation": string,              // one short paragraph: what should the reader do with this verdict?
  "metadataNote": string                 // 1-2 sentences interpreting the supplied EXIF metadata block (provided after this prompt). If metadata is missing or stripped, say so and what that implies. If it shows AI-tool software tags, call it out.
}`

const responseSchema = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["AUTHENTIC", "SYNTHETIC", "UNCERTAIN"] },
    confidence: { type: "number" },
    oneLiner: { type: "string" },
    reasoning: { type: "string" },
    signals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          status: { type: "string", enum: ["clean", "flagged", "neutral"] },
          detail: { type: "string" },
        },
        required: ["label", "status", "detail"],
      },
    },
    artifacts: { type: "array", items: { type: "string" } },
    recommendation: { type: "string" },
    metadataNote: { type: "string" },
  },
  required: ["verdict", "confidence", "oneLiner", "reasoning", "signals", "artifacts", "recommendation", "metadataNote"],
} as const

export type Analysis = {
  verdict: "AUTHENTIC" | "SYNTHETIC" | "UNCERTAIN"
  confidence: number
  oneLiner: string
  reasoning: string
  signals: { label: string; status: "clean" | "flagged" | "neutral"; detail: string }[]
  artifacts: string[]
  recommendation: string
  metadataNote?: string
  metadata?: Metadata
}

const INFERENCE_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"

export async function analyzeImage({
  base64,
  mimeType,
  metadata,
  model = DEFAULT_MODEL,
}: {
  base64: string
  mimeType: string
  metadata?: Metadata
  model?: string
}): Promise<Analysis> {
  const apiKey = process.env.FORENSIQ_INFERENCE_KEY!

  const metaBlock = metadata
    ? `IMAGE METADATA (extracted by the server before you saw the image):
${JSON.stringify(
  {
    format: metadata.format,
    byteSize: metadata.byteSize,
    width: metadata.width,
    height: metadata.height,
    camera: metadata.camera ?? null,
    lens: metadata.lens ?? null,
    software: metadata.software ?? null,
    takenAt: metadata.takenAt ?? null,
    iso: metadata.iso ?? null,
    fNumber: metadata.fNumber ?? null,
    exposureTime: metadata.exposureTime ?? null,
    focalLength: metadata.focalLength ?? null,
    gps: metadata.gps,
    hasExif: metadata.hasExif,
    examinerFlags: metadata.exifFlags,
  },
  null,
  2
)}

Use this metadata in your verdict. Missing EXIF on a photo claiming to be a real capture is suspicious. Software tags pointing to AI tools are conclusive evidence.`
    : ""

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: PROMPT + (metaBlock ? "\n\n" + metaBlock : "") },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema,
    },
  }

  const res = await fetch(`${INFERENCE_ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Inference ${res.status}: ${errText.slice(0, 500)}`)
  }

  const json: any = await res.json()
  const text: string | undefined =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ??
    json?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text)
      ?.filter(Boolean)
      ?.join("")

  if (!text) throw new Error("Inference returned no text payload.")

  let parsed: Analysis
  try {
    parsed = JSON.parse(text)
  } catch {
    const stripped = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim()
    parsed = JSON.parse(stripped)
  }

  parsed.confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0))
  parsed.signals = (parsed.signals ?? []).slice(0, 6)
  parsed.artifacts = (parsed.artifacts ?? []).slice(0, 5)
  parsed.metadata = metadata

  return parsed
}
