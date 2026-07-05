import { PDFParse } from "pdf-parse"

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".csv", ".json", ".log"])

export function inferMimeType(fileName: string, mimeType?: string): string {
  if (mimeType?.trim()) return mimeType.trim().toLowerCase()
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".pdf")) return "application/pdf"
  if (lower.endsWith(".txt")) return "text/plain"
  if (lower.endsWith(".md")) return "text/markdown"
  if (lower.endsWith(".csv")) return "text/csv"
  return "application/octet-stream"
}

export function isIndexableMimeType(mimeType: string, fileName: string): boolean {
  const mime = inferMimeType(fileName, mimeType)
  if (mime === "application/pdf") return true
  if (mime.startsWith("text/")) return true
  const lower = fileName.toLowerCase()
  const ext = lower.includes(".") ? lower.slice(lower.lastIndexOf(".")) : ""
  return TEXT_EXTENSIONS.has(ext)
}

export function displayFileType(mimeType: string, fileName: string): string {
  const mime = inferMimeType(fileName, mimeType)
  if (mime === "application/pdf") return "PDF"
  if (mime.includes("spreadsheet") || fileName.match(/\.(xlsx?|csv)$/i)) {
    return "Spreadsheet"
  }
  if (mime.startsWith("text/")) return "Text"
  if (mime.startsWith("video/")) return "Video"
  if (mime.startsWith("image/")) return "Image"
  return "File"
}

export async function extractTextFromUrl(
  url: string,
  mimeType: string,
  fileName: string
): Promise<string> {
  const resolvedMime = inferMimeType(fileName, mimeType)

  if (!isIndexableMimeType(resolvedMime, fileName)) {
    throw new Error("File type is not supported for AI indexing")
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download file (${res.status})`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())

  if (resolvedMime === "application/pdf") {
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      return result.text.trim()
    } finally {
      await parser.destroy()
    }
  }

  return buffer.toString("utf-8").trim()
}
