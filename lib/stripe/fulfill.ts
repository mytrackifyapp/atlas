import { ObjectId } from "mongodb"

import { addPurchasedCredits, setAiSubscriptionPlan } from "@/lib/ai-credits/service"
import { getCreditPack, isCreditPackId } from "@/lib/ai-credits/packs"
import { isCheckoutPlanId, type CheckoutPlanId } from "@/lib/checkout/catalog"
import { getDatabase } from "@/lib/db"
import type { BillingInterval } from "@/lib/pricing-plans"
import { findOwnerIdByStripeCustomer } from "@/lib/stripe/customers"
import type Stripe from "stripe"

async function claimFulfillment(key: string, payload: Record<string, unknown>) {
  const db = await getDatabase()
  try {
    await db.collection("stripe_fulfillments").insertOne({
      key,
      ...payload,
      createdAt: new Date(),
    })
    return true
  } catch (error) {
    const duplicate = error instanceof Error && /duplicate key|E11000/i.test(error.message)
    if (duplicate) return false
    throw error
  }
}

export async function ensureStripeIndexes() {
  const db = await getDatabase()
  await db.collection("stripe_fulfillments").createIndex({ key: 1 }, { unique: true })
  await db.collection("user").createIndex({ stripeCustomerId: 1 }, { sparse: true })
}

async function releaseFulfillment(key: string) {
  const db = await getDatabase()
  await db.collection("stripe_fulfillments").deleteOne({ key })
}

function userQuery(ownerId: string) {
  const clauses: Record<string, unknown>[] = [{ id: ownerId }]
  if (ObjectId.isValid(ownerId)) clauses.push({ _id: new ObjectId(ownerId) })
  return { $or: clauses }
}

function customerIdOf(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
) {
  if (!customer) return null
  return typeof customer === "string" ? customer : customer.id
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  await ensureStripeIndexes()
  const claimed = await claimFulfillment(`checkout:${session.id}`, {
    type: "checkout.session",
    sessionId: session.id,
  })
  if (!claimed) return { alreadyFulfilled: true as const }

  try {
  const metadata = session.metadata ?? {}
  const ownerId =
    metadata.ownerId ||
    (await findOwnerIdByStripeCustomer(customerIdOf(session.customer) ?? ""))
  if (!ownerId) {
    throw new Error("Could not match Stripe checkout to a Trackify user")
  }

  const db = await getDatabase()
  const stripeCustomerId = customerIdOf(session.customer)
  if (stripeCustomerId) {
    await db.collection("user").updateOne(userQuery(ownerId), {
      $set: { stripeCustomerId },
    })
  }

  if (session.mode === "payment" || metadata.kind === "credits") {
    const packId = metadata.creditPackId
    const credits =
      Number(metadata.creditsAmount) ||
      (packId && isCreditPackId(packId) ? getCreditPack(packId).credits : 0)
    if (!credits) throw new Error("Stripe credit checkout is missing credit amount")
    await addPurchasedCredits(ownerId, credits)
    return { alreadyFulfilled: false as const, kind: "credits" as const, ownerId, credits }
  }

  const planId = metadata.planId
  if (!planId || !isCheckoutPlanId(planId)) {
    throw new Error("Stripe subscription checkout is missing a plan")
  }
  const interval = (metadata.billingInterval === "monthly" ? "monthly" : "annual") as BillingInterval
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id

  await setAiSubscriptionPlan(ownerId, planId, metadata.trialing === "true" ? "trial" : "active", {
    stripeCustomerId: stripeCustomerId ?? undefined,
    stripeSubscriptionId: subscriptionId,
    billingInterval: interval,
    provider: "stripe",
  })

  return { alreadyFulfilled: false as const, kind: "subscription" as const, ownerId, planId }
  } catch (error) {
    await releaseFulfillment(`checkout:${session.id}`)
    throw error
  }
}

export async function fulfillSubscriptionRenewal(invoice: Stripe.Invoice) {
  if (invoice.billing_reason !== "subscription_cycle") return { skipped: true as const }

  await ensureStripeIndexes()
  const claimed = await claimFulfillment(`invoice:${invoice.id}`, {
    type: "invoice.paid",
    invoiceId: invoice.id,
  })
  if (!claimed) return { alreadyFulfilled: true as const }

  try {
    const details = invoice.parent?.subscription_details
    const subscriptionRef = details?.subscription
    const subscriptionId =
      typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id
    const metadata = details?.metadata ?? {}
    const customerId = customerIdOf(invoice.customer)
    const ownerId =
      metadata.ownerId || (customerId ? await findOwnerIdByStripeCustomer(customerId) : null)
    if (!ownerId) {
      await releaseFulfillment(`invoice:${invoice.id}`)
      return { skipped: true as const }
    }

    const planId = metadata.planId
    if (!planId || !isCheckoutPlanId(planId)) {
      await releaseFulfillment(`invoice:${invoice.id}`)
      return { skipped: true as const }
    }

    await setAiSubscriptionPlan(ownerId, planId, "active", {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscriptionId,
      billingInterval: metadata.billingInterval === "monthly" ? "monthly" : "annual",
      provider: "stripe",
    })

    return { alreadyFulfilled: false as const }
  } catch (error) {
    await releaseFulfillment(`invoice:${invoice.id}`)
    throw error
  }
}

export async function applyStripeSubscription(subscription: Stripe.Subscription) {
  const customerId = customerIdOf(subscription.customer)
  const ownerId =
    subscription.metadata?.ownerId ||
    (customerId ? await findOwnerIdByStripeCustomer(customerId) : null)
  if (!ownerId) return

  const status = subscription.status
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    await setAiSubscriptionPlan(ownerId, "free", "cancelled", {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: undefined,
      provider: "stripe",
    })
    return
  }

  const planId = subscription.metadata?.planId
  if (!planId || !isCheckoutPlanId(planId)) return

  await setAiSubscriptionPlan(
    ownerId,
    planId,
    status === "trialing" ? "trial" : "active",
    {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      billingInterval: subscription.metadata.billingInterval === "monthly" ? "monthly" : "annual",
      provider: "stripe",
    },
  )
}
