const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g

function redactString(value: string): string {
  return value
    .replace(EMAIL_RE, "[email redacted]")
    .replace(CARD_RE, "[card redacted]")
}

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") return redactString(value)
  if (Array.isArray(value)) return value.map(redactValue)
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.toLowerCase().includes("password") || k.toLowerCase().includes("token")) {
        out[k] = "[redacted]"
      } else {
        out[k] = redactValue(v)
      }
    }
    return out
  }
  return value
}

export function redactMetadata(
  metadata?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!metadata) return undefined
  return redactValue(metadata) as Record<string, unknown>
}
