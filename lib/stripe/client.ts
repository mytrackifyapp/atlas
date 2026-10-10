import Stripe from "stripe"

let stripe: Stripe | null = null

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to continue.")
  }
  if (!stripe) {
    stripe = new Stripe(key)
  }
  return stripe
}
