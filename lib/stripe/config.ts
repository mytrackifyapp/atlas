export function getAppUrl() {
  const fromEnv = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  )
    .trim()
    .replace(/\/$/, "")

  return fromEnv || "http://localhost:3000"
}

export function getStripePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    ""
  )
}

export function isStripeSecretConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

export function isStripeConfigured() {
  return isStripeSecretConfigured() && Boolean(getStripePublishableKey())
}
