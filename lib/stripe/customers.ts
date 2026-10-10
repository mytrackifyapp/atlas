import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import { getStripe } from "@/lib/stripe/client"

function userQuery(ownerId: string) {
  const clauses: Record<string, unknown>[] = [{ id: ownerId }]
  if (ObjectId.isValid(ownerId)) {
    clauses.push({ _id: new ObjectId(ownerId) })
  }
  return { $or: clauses }
}

export async function getOrCreateStripeCustomer(input: {
  ownerId: string
  email?: string | null
  name?: string | null
}) {
  const db = await getDatabase()
  const user = await db.collection("user").findOne(userQuery(input.ownerId))

  const existingId =
    (typeof user?.stripeCustomerId === "string" && user.stripeCustomerId) ||
    (await db.collection("ai_subscriptions").findOne({ ownerId: input.ownerId }))?.stripeCustomerId

  const stripe = getStripe()

  if (typeof existingId === "string" && existingId.startsWith("cus_")) {
    try {
      const customer = await stripe.customers.retrieve(existingId)
      if (!("deleted" in customer && customer.deleted)) return customer.id
    } catch {
      // Create a fresh customer if the stored id is stale.
    }
  }

  const customer = await stripe.customers.create({
    email: input.email ?? user?.email ?? undefined,
    name: input.name ?? user?.name ?? undefined,
    metadata: { ownerId: input.ownerId },
  })

  await db.collection("user").updateOne(userQuery(input.ownerId), {
    $set: { stripeCustomerId: customer.id },
  })
  await db.collection("ai_subscriptions").updateOne(
    { ownerId: input.ownerId },
    { $set: { ownerId: input.ownerId, stripeCustomerId: customer.id, updatedAt: new Date() } },
    { upsert: true },
  )

  return customer.id
}

export async function findOwnerIdByStripeCustomer(customerId: string) {
  const db = await getDatabase()
  const user = await db.collection("user").findOne({ stripeCustomerId: customerId })
  if (user) return String(user.id ?? user._id)
  const sub = await db.collection("ai_subscriptions").findOne({ stripeCustomerId: customerId })
  return typeof sub?.ownerId === "string" ? sub.ownerId : null
}
