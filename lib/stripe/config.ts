import { configuredPublicOrigin } from "@/lib/public-origin"

export function getAppUrl() {
  return configuredPublicOrigin()
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
