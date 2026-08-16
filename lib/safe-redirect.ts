export function safeInternalPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback
  const path = value.trim()
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback
  }
  return path
}

export function finnaPromptPath(q: string) {
  return `/finna?q=${encodeURIComponent(q)}`
}

export function signUpForFinnaPath(q: string) {
  return `/sign-up?redirect=${encodeURIComponent(finnaPromptPath(q))}`
}
