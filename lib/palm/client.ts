const PALM_API_BASE = process.env.PALM_API_BASE_URL?.trim() || "https://api.getpalm.com"

export class PalmError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message)
    this.name = "PalmError"
  }
}

export function isPalmConfigured() {
  return Boolean(process.env.PALM_API_KEY?.trim())
}

export async function palmFetch<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const key = process.env.PALM_API_KEY?.trim()
  if (!key) {
    throw new PalmError(
      503,
      { detail: "PALM_API_KEY is not set" },
      "U.S. formation is not configured yet. Add a Palm API key to continue.",
    )
  }

  const { idempotencyKey, headers: extraHeaders, ...rest } = init
  const headers = new Headers(extraHeaders)
  headers.set("Authorization", `Bearer ${key}`)
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json")
  }
  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey)
  }

  const res = await fetch(`${PALM_API_BASE}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  })

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { detail: text }
    }
  }

  if (!res.ok) {
    const detail =
      typeof body === "object" && body && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Palm request failed (${res.status})`
    throw new PalmError(res.status, body, detail)
  }

  return body as T
}

export function palmErrorResponse(error: unknown) {
  if (error instanceof PalmError) {
    return {
      status: error.status >= 400 && error.status < 600 ? error.status : 502,
      body: {
        error: error.message,
        palm: error.body,
      },
    }
  }
  console.error("Palm request failed", error)
  return {
    status: 500,
    body: { error: "Formation request failed" },
  }
}
