import type { LoungeAttachment, LoungeAttachmentKind } from "@/lib/lounge/types"

const URL_RE = /https?:\/\/[^\s<>"']+/gi
const MAX_ATTACHMENTS = 6

export function extractUrls(text: string): string[] {
  return (text.match(URL_RE) ?? []).map((url) => url.replace(/[),.]+$/, ""))
}

export function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function kindFromFile(file: { name?: string; type?: string }): LoungeAttachmentKind {
  const mime = file.type?.toLowerCase() ?? ""
  const name = file.name?.toLowerCase() ?? ""
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) return "image"
  return "file"
}

export function sanitizeAttachments(input: unknown): LoungeAttachment[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const attachments: LoungeAttachment[] = []

  for (const item of input) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    const url = typeof row.url === "string" ? row.url.trim() : ""
    if (!/^https?:\/\//i.test(url) || seen.has(url)) continue
    seen.add(url)

    const kind: LoungeAttachmentKind =
      row.kind === "image" || row.kind === "file" || row.kind === "link" ? row.kind : "file"
    attachments.push({
      id: typeof row.id === "string" && row.id.trim() ? row.id : crypto.randomUUID(),
      kind,
      url,
      name: typeof row.name === "string" && row.name.trim() ? row.name.trim().slice(0, 200) : hostnameOf(url),
      mimeType: typeof row.mimeType === "string" ? row.mimeType : undefined,
      sizeBytes: typeof row.sizeBytes === "number" ? row.sizeBytes : undefined,
    })
    if (attachments.length >= MAX_ATTACHMENTS) break
  }

  return attachments
}

export function mergeLinkAttachments(body: string, attachments: LoungeAttachment[]): LoungeAttachment[] {
  const existing = new Set(attachments.map((item) => item.url))
  const extras = extractUrls(body)
    .filter((url) => !existing.has(url))
    .map((url) => ({
      id: crypto.randomUUID(),
      kind: "link" as const,
      url,
      name: hostnameOf(url),
    }))
  return sanitizeAttachments([...attachments, ...extras])
}

export const LOUNGE_MAX_ATTACHMENTS = MAX_ATTACHMENTS
