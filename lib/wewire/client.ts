export function wewireConfig() {
  const apiKey = process.env.WEWIRE_API_KEY?.trim() || ""
  const baseUrl = (
    process.env.WEWIRE_API_BASE?.trim() ||
    (process.env.WEWIRE_ENV === "production"
      ? "https://capi.wewire.com"
      : "https://stage-capi.wewireafrica.com")
  ).replace(/\/$/, "")

  return { apiKey, baseUrl, configured: Boolean(apiKey) }
}

export class WewireError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function wewireRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { apiKey, baseUrl, configured } = wewireConfig()
  if (!configured) {
    throw new WewireError("WeWire is not configured", 503)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "ww-api-key": apiKey,
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  const body = text ? (JSON.parse(text) as T & { message?: string; statusCode?: string }) : ({} as T)
  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body && body.message
        ? String(body.message)
        : `WeWire request failed (${response.status})`
    const code = typeof body === "object" && body && "statusCode" in body ? String(body.statusCode) : undefined
    throw new WewireError(message, response.status, code)
  }
  return body
}
