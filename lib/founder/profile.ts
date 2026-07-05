import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import { isFounderVerified, getPublicFounderKyc, type FounderKycFields } from "@/lib/founder/verification"

export type FounderPublicKyc = FounderKycFields

export type FounderPublicProfile = {
  founderName: string
  founderTitle: string
  founderBio: string
  founderPhoto: string | null
  founderVerified: boolean
  founderKyc: FounderPublicKyc | null
}

export type FounderProfileInput = {
  name?: string
  image?: string | null
  founderTitle?: string
  founderBio?: string
}

async function findUserById(userId: string) {
  const db = await getDatabase()
  if (!ObjectId.isValid(userId)) return null
  return db.collection("user").findOne({ _id: new ObjectId(userId) })
}

export function userToFounderProfile(user: Record<string, unknown> | null): FounderPublicProfile {
  if (!user) {
    return {
      founderName: "",
      founderTitle: "",
      founderBio: "",
      founderPhoto: null,
      founderVerified: false,
      founderKyc: null,
    }
  }
  return {
    founderName: String(user.name ?? ""),
    founderTitle: user.role === "founder" ? "Founder" : String(user.founderTitle ?? ""),
    founderBio: String(user.founderBio ?? ""),
    founderPhoto: user.image ? String(user.image) : null,
    founderVerified: isFounderVerified(user),
    founderKyc: getPublicFounderKyc(user),
  }
}

export async function getFounderPublicProfile(userId: string): Promise<FounderPublicProfile> {
  const user = await findUserById(userId)
  return userToFounderProfile(user)
}

export async function updateFounderProfile(
  userId: string,
  input: FounderProfileInput,
): Promise<FounderPublicProfile> {
  const db = await getDatabase()
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid user")
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (input.name !== undefined) updates.name = input.name.trim()
  if (input.image !== undefined) updates.image = input.image
  if (input.founderTitle !== undefined) updates.founderTitle = input.founderTitle.trim()
  if (input.founderBio !== undefined) updates.founderBio = input.founderBio.trim()

  await db.collection("user").updateOne({ _id: new ObjectId(userId) }, { $set: updates })

  const user = await findUserById(userId)
  return userToFounderProfile(user)
}
