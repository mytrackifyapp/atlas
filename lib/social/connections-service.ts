import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { SocialConnection } from "@/lib/social/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("social_connections").createIndex(
    { ownerId: 1, platform: 1 },
    { unique: true }
  )
  indexesEnsured = true
}

function toConnection(row: {
  _id: ObjectId
  ownerId: string
  platform: "linkedin"
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  profileId: string
  profileUrn: string
  displayName?: string
  createdAt: Date
  updatedAt: Date
}): SocialConnection {
  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    platform: row.platform,
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    expiresAt: row.expiresAt,
    profileId: row.profileId,
    profileUrn: row.profileUrn,
    displayName: row.displayName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getSocialConnection(
  ownerId: string,
  platform: "linkedin"
): Promise<SocialConnection | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const row = await db.collection("social_connections").findOne({ ownerId, platform })
  return row ? toConnection(row as Parameters<typeof toConnection>[0]) : null
}

export async function upsertSocialConnection(
  ownerId: string,
  input: Omit<SocialConnection, "id" | "ownerId" | "createdAt" | "updatedAt">
): Promise<SocialConnection> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()

  const doc = {
    ownerId,
    platform: input.platform,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    expiresAt: input.expiresAt,
    profileId: input.profileId,
    profileUrn: input.profileUrn,
    displayName: input.displayName,
    updatedAt: now,
  }

  const result = await db.collection("social_connections").findOneAndUpdate(
    { ownerId, platform: input.platform },
    {
      $set: doc,
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" }
  )

  return toConnection(result as Parameters<typeof toConnection>[0])
}

export async function deleteSocialConnection(
  ownerId: string,
  platform: "linkedin"
): Promise<boolean> {
  await ensureIndexes()
  const db = await getDatabase()
  const result = await db.collection("social_connections").deleteOne({ ownerId, platform })
  return result.deletedCount === 1
}
