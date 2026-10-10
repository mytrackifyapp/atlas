const PRODUCTION_ORIGIN = "https://mytrackify.com"

function isLocalOrigin(value: string) {
  return !value || /localhost|127\.0\.0\.1/.test(value)
}

/**
 * Public site origin used for auth and Stripe return URLs.
 * On the production deployment, a missing or localhost URL falls back to
 * mytrackify.com so a copied local env cannot reject real sign-ins.
 */
export function configuredPublicOrigin() {
  const raw = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "")

  if (process.env.VERCEL_ENV === "production" && isLocalOrigin(raw)) {
    return PRODUCTION_ORIGIN
  }

  if (!isLocalOrigin(raw)) return raw
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return raw || "http://localhost:3000"
}
