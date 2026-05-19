import { jsPDF } from "jspdf"
import type { Analysis } from "@/pages/Detect"

const INK = "#15120c"
const MUTED = "#6b6256"
const ACCENT = "#c2371d"
const RULE = "#d4cab2"

async function imageToDataUrl(src: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject()
    })
    const MAX = 1200
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, w, h)
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), w, h }
  } catch {
    return null
  }
}

export async function downloadPdfReport(data: Analysis, imageSrc?: string | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 56 // margin
  let y = M

  const evidence = imageSrc ? await imageToDataUrl(imageSrc) : null

  // ──────────────────────── HEADER ────────────────────────
  doc.setTextColor(MUTED)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("DEEPDETECT · FORENSIC DOSSIER", M, y)
  doc.text(new Date().toLocaleString(), W - M, y, { align: "right" })
  y += 14
  rule(doc, M, y, W - M)
  y += 28

  // Brand
  doc.setTextColor(INK)
  doc.setFont("times", "normal")
  doc.setFontSize(40)
  doc.text("DeepDetect", M, y)
  y += 22
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text("CASE FILE · IMAGE AUTHENTICATION", M, y)
  y += 28

  // ──────────────────────── VERDICT BLOCK ────────────────────────
  const isFake = data.verdict === "SYNTHETIC"
  const isUncertain = data.verdict === "UNCERTAIN"
  const verdictColor = isFake ? ACCENT : isUncertain ? "#b8843a" : INK
  const headline = isFake ? "Likely AI-generated" : isUncertain ? "Inconclusive" : "Likely authentic"

  doc.setTextColor(MUTED)
  doc.setFontSize(8)
  doc.text("VERDICT", M, y)
  y += 36 // leave room for the 36pt headline that follows (baseline-positioned text needs ascent space)
  doc.setTextColor(verdictColor)
  doc.setFont("times", "normal")
  doc.setFontSize(36)
  doc.text(headline, M, y)
  y += 26
  doc.setFontSize(10)
  doc.setTextColor(MUTED)
  doc.setFont("helvetica", "normal")
  doc.text(`CONFIDENCE ${data.confidence.toFixed(1)} %`, M, y)
  y += 10

  // Confidence bar
  const barW = W - M * 2
  doc.setFillColor("#e8e1cf")
  doc.rect(M, y, barW, 5, "F")
  doc.setFillColor(verdictColor)
  doc.rect(M, y, (barW * data.confidence) / 100, 5, "F")
  y += 28

  // One-liner
  doc.setFont("times", "italic")
  doc.setFontSize(13)
  doc.setTextColor(INK)
  y = wrapText(doc, `"${data.oneLiner}"`, M + 8, y, W - M * 2 - 8, 18) + 18

  rule(doc, M, y, W - M)
  y += 22

  // ──────────────────────── EVIDENCE IMAGE ────────────────────────
  if (evidence) {
    y = sectionLabel(doc, "EVIDENCE IMAGE", M, y)
    const maxImgW = W - M * 2
    const maxImgH = 280
    const ratio = evidence.w / evidence.h
    let imgW = maxImgW
    let imgH = imgW / ratio
    if (imgH > maxImgH) {
      imgH = maxImgH
      imgW = imgH * ratio
    }
    y = ensureRoom(doc, y, imgH + 16, M)
    const imgX = M + (maxImgW - imgW) / 2
    doc.setDrawColor(RULE)
    doc.rect(imgX - 1, y - 1, imgW + 2, imgH + 2)
    doc.addImage(evidence.dataUrl, "JPEG", imgX, y, imgW, imgH)
    y += imgH + 22
  }

  // ──────────────────────── REASONING ────────────────────────
  y = sectionLabel(doc, "REASONING", M, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(INK)
  y = wrapText(doc, data.reasoning, M, y, W - M * 2, 15) + 18

  // ──────────────────────── SIGNALS ────────────────────────
  y = ensureRoom(doc, y, 160, M)
  y = sectionLabel(doc, "FORENSIC SIGNALS", M, y)
  const colW = (W - M * 2 - 12) / 2
  for (let i = 0; i < data.signals.length; i++) {
    const s = data.signals[i]
    const col = i % 2
    const rowY = y + Math.floor(i / 2) * 56
    const x = M + col * (colW + 12)
    doc.setDrawColor(RULE)
    doc.rect(x, rowY, colW, 50)
    doc.setTextColor(INK)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(s.label.toUpperCase(), x + 8, rowY + 14)
    // status pill
    const statusColor =
      s.status === "flagged" ? ACCENT : s.status === "clean" ? INK : MUTED
    doc.setTextColor(statusColor)
    doc.setFont("helvetica", "bold")
    doc.text(s.status.toUpperCase(), x + colW - 8, rowY + 14, { align: "right" })
    // detail
    doc.setTextColor(MUTED)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    wrapText(doc, s.detail, x + 8, rowY + 28, colW - 16, 11)
  }
  y += Math.ceil(data.signals.length / 2) * 56 + 16

  // ──────────────────────── ARTIFACTS ────────────────────────
  if (data.artifacts?.length) {
    y = ensureRoom(doc, y, 80, M)
    y = sectionLabel(doc, "ARTIFACTS SPOTTED", M, y)
    doc.setTextColor(INK)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    for (let i = 0; i < data.artifacts.length; i++) {
      const tag = String(i + 1).padStart(2, "0")
      doc.setTextColor(ACCENT)
      doc.text(tag, M, y)
      doc.setTextColor(INK)
      y = wrapText(doc, data.artifacts[i], M + 26, y, W - M * 2 - 26, 14) + 6
    }
    y += 12
  }

  // ──────────────────────── METADATA ────────────────────────
  if (data.metadata) {
    y = ensureRoom(doc, y, 200, M)
    y = sectionLabel(
      doc,
      `IMAGE METADATA · EXIF ${data.metadata.hasExif ? "present" : "stripped"}`,
      M,
      y
    )
    const rawRows: Array<[string, string | undefined | null]> = [
      ["Format", data.metadata.format],
      ["Dimensions", data.metadata.width && data.metadata.height ? `${data.metadata.width} × ${data.metadata.height} px` : null],
      ["Size", data.metadata.byteSize ? `${(data.metadata.byteSize / 1024).toFixed(1)} kB` : null],
      ["Camera", data.metadata.camera],
      ["Lens", data.metadata.lens],
      ["Software", data.metadata.software],
      ["Captured", data.metadata.takenAt ? new Date(data.metadata.takenAt).toLocaleString() : null],
      ["ISO", data.metadata.iso ? String(data.metadata.iso) : null],
      ["Aperture", data.metadata.fNumber ? `f/${data.metadata.fNumber}` : null],
      ["Shutter", data.metadata.exposureTime],
      ["Focal length", data.metadata.focalLength ? `${data.metadata.focalLength} mm` : null],
      ["GPS", data.metadata.gps ? `${data.metadata.gps.lat.toFixed(4)}, ${data.metadata.gps.lon.toFixed(4)}` : null],
    ]
    const rows = rawRows.filter(
      (entry): entry is [string, string] => entry[1] != null && entry[1] !== ""
    )

    doc.setDrawColor(RULE)
    doc.setFontSize(9)
    for (const [k, v] of rows) {
      y = ensureRoom(doc, y, 22, M)
      rule(doc, M, y - 2, W - M)
      doc.setTextColor(MUTED)
      doc.setFont("helvetica", "normal")
      doc.text(k.toUpperCase(), M, y + 12)
      doc.setTextColor(INK)
      doc.text(v, W - M, y + 12, { align: "right" })
      y += 18
    }
    rule(doc, M, y - 2, W - M)
    y += 12

    if (data.metadataNote) {
      doc.setTextColor(INK)
      doc.setFont("times", "italic")
      doc.setFontSize(11)
      y = wrapText(doc, data.metadataNote, M, y, W - M * 2, 14) + 12
    }
  }

  // ──────────────────────── RECOMMENDATION ────────────────────────
  y = ensureRoom(doc, y, 80, M)
  y = sectionLabel(doc, "RECOMMENDATION", M, y)
  doc.setTextColor(INK)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  y = wrapText(doc, data.recommendation, M, y, W - M * 2, 15) + 24

  // Footer
  rule(doc, M, H - M + 8, W - M)
  doc.setTextColor(MUTED)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("DeepDetect · MGM's College of Engineering & Technology · final-year capstone", M, H - M + 22)
  doc.text("© 2026", W - M, H - M + 22, { align: "right" })

  const fname = `deepdetect-${data.verdict.toLowerCase()}-${Date.now()}.pdf`
  doc.save(fname)
}

function rule(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.setDrawColor(RULE)
  doc.setLineWidth(0.5)
  doc.line(x1, y, x2, y)
}

function sectionLabel(doc: jsPDF, label: string, x: number, y: number) {
  doc.setTextColor(MUTED)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text(label, x, y)
  return y + 16
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lh: number) {
  const lines = doc.splitTextToSize(text, maxW)
  for (const line of lines) {
    doc.text(line, x, y)
    y += lh
  }
  return y
}

function ensureRoom(doc: jsPDF, y: number, need: number, M: number) {
  const H = doc.internal.pageSize.getHeight()
  if (y + need > H - M) {
    doc.addPage()
    return M
  }
  return y
}
