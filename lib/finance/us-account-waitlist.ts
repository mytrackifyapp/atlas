import { getDatabase } from "@/lib/db"

type WaitlistEntry = {
  userId: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export async function getUsAccountWaitlist(userId: string) {
  const db = await getDatabase()
  const entry = await db.collection<WaitlistEntry>("us_account_waitlist").findOne({ userId })
  if (!entry) return { joined: false as const, email: null }
  return { joined: true as const, email: entry.email }
}

export async function joinUsAccountWaitlist(input: { userId: string; email: string; name: string | null }) {
  const db = await getDatabase()
  const now = new Date()
  await db.collection<WaitlistEntry>("us_account_waitlist").updateOne(
    { userId: input.userId },
    {
      $set: { email: input.email, name: input.name, updatedAt: now },
      $setOnInsert: { userId: input.userId, createdAt: now },
    },
    { upsert: true },
  )
  return { joined: true as const, email: input.email }
}
