import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import {
  hasValidSocialLinks,
  migrateLegacySocialHandle,
  normalizeSocialLinks,
  parseSocialLinks,
  type FounderSocialLink,
} from "@/lib/founder/social-platforms"

export type { FounderSocialLink } from "@/lib/founder/social-platforms"

export type FounderKycFields = {
  fullName: string
  location: string
  phoneNumber: string
  socialLinks: FounderSocialLink[]
}

export type FounderVerificationRecord = FounderKycFields & {
  verified: boolean
  submittedAt: string | null
  verifiedAt: string | null
}

export type FounderVerificationInput = {
  fullName?: string
  location?: string
  phoneNumber?: string
  socialLinks?: FounderSocialLink[]
}

async function findUserById(userId: string) {
  const db = await getDatabase()
  if (!ObjectId.isValid(userId)) return null
  return db.collection("user").findOne({ _id: new ObjectId(userId) })
}

function readSocialLinks(kyc: Record<string, unknown>): FounderSocialLink[] {
  const parsed = parseSocialLinks(kyc.socialLinks)
  if (parsed.length > 0) return parsed

  const legacy = String(kyc.socialHandle ?? "")
  if (legacy.trim()) return migrateLegacySocialHandle(legacy)

  return []
}

function readKyc(user: Record<string, unknown> | null): FounderKycFields {
  const kyc = (user?.founderKyc ?? {}) as Record<string, unknown>
  return {
    fullName: String(kyc.fullName ?? user?.name ?? ""),
    location: String(kyc.location ?? ""),
    phoneNumber: String(kyc.phoneNumber ?? ""),
    socialLinks: readSocialLinks(kyc),
  }
}

export function isKycComplete(kyc: FounderKycFields): boolean {
  return Boolean(
    kyc.fullName.trim() &&
      kyc.location.trim() &&
      kyc.phoneNumber.trim() &&
      hasValidSocialLinks(kyc.socialLinks),
  )
}

export function userToVerificationRecord(
  user: Record<string, unknown> | null,
): FounderVerificationRecord {
  const kyc = readKyc(user)
  const submittedAt = user?.founderKycSubmittedAt
  const verifiedAt = user?.founderVerifiedAt
  return {
    ...kyc,
    verified: Boolean(user?.founderVerified),
    submittedAt: submittedAt instanceof Date ? submittedAt.toISOString() : submittedAt ? String(submittedAt) : null,
    verifiedAt: verifiedAt instanceof Date ? verifiedAt.toISOString() : verifiedAt ? String(verifiedAt) : null,
  }
}

export async function getFounderVerification(userId: string): Promise<FounderVerificationRecord> {
  const user = await findUserById(userId)
  return userToVerificationRecord(user)
}

export async function submitFounderVerification(
  userId: string,
  input: FounderVerificationInput,
): Promise<FounderVerificationRecord> {
  const db = await getDatabase()
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid user")
  }

  const existing = await findUserById(userId)
  const current = readKyc(existing)

  const kyc: FounderKycFields = {
    fullName: (input.fullName ?? current.fullName).trim(),
    location: (input.location ?? current.location).trim(),
    phoneNumber: (input.phoneNumber ?? current.phoneNumber).trim(),
    socialLinks: normalizeSocialLinks(input.socialLinks ?? current.socialLinks),
  }

  if (!isKycComplete(kyc)) {
    throw new Error("Full name, location, phone number, and at least one social profile are required")
  }

  const now = new Date()
  const updates: Record<string, unknown> = {
    founderKyc: kyc,
    founderKycSubmittedAt: now,
    founderVerified: true,
    founderVerifiedAt: now,
    name: kyc.fullName,
    updatedAt: now,
  }

  await db.collection("user").updateOne({ _id: new ObjectId(userId) }, { $set: updates })

  const user = await findUserById(userId)
  return userToVerificationRecord(user)
}

export function isFounderVerified(user: Record<string, unknown> | null): boolean {
  return Boolean(user?.founderVerified)
}

export function getPublicFounderKyc(user: Record<string, unknown> | null): FounderKycFields | null {
  if (!isFounderVerified(user)) return null
  const kyc = readKyc(user)
  if (!hasValidSocialLinks(kyc.socialLinks) && !kyc.location.trim() && !kyc.phoneNumber.trim()) {
    return null
  }
  return kyc
}
