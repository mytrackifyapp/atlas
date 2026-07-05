import { getDatabase } from "@/lib/db"
import type { SocialBrandKit, UpdateBrandKitInput } from "@/lib/social/types"

const DEFAULT_PRIMARY = "#0F172A"
const DEFAULT_SECONDARY = "#1E293B"
const DEFAULT_ACCENT = "#C1FF72"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("social_brand_kits").createIndex({ ownerId: 1 }, { unique: true })
  indexesEnsured = true
}

async function resolveCompanyName(ownerId: string): Promise<string> {
  const db = await getDatabase()

  const fundraise = await db.collection("fundraises").findOne({ userId: ownerId })
  if (fundraise?.companyName && typeof fundraise.companyName === "string") {
    return fundraise.companyName.trim()
  }

  const user = await db.collection("user").findOne({ id: ownerId })
  if (user?.companyName && typeof user.companyName === "string") {
    return user.companyName.trim()
  }

  if (user?.name && typeof user.name === "string") {
    return user.name.trim()
  }

  return "Your Company"
}

async function resolveLogoUrl(ownerId: string): Promise<string | undefined> {
  const db = await getDatabase()

  const fundraise = await db.collection("fundraises").findOne({ userId: ownerId })
  if (fundraise?.logo && typeof fundraise.logo === "string") {
    return fundraise.logo
  }

  const company = await db.collection("companies").findOne({ userId: ownerId })
  if (company?.logo && typeof company.logo === "string") {
    return company.logo
  }

  return undefined
}

function toBrandKit(row: {
  ownerId: string
  companyName?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  updatedAt: Date
}): SocialBrandKit {
  return {
    ownerId: row.ownerId,
    companyName: row.companyName ?? "Your Company",
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: row.secondaryColor ?? DEFAULT_SECONDARY,
    accentColor: row.accentColor ?? DEFAULT_ACCENT,
    updatedAt: row.updatedAt,
  }
}

export async function getBrandKit(ownerId: string): Promise<SocialBrandKit> {
  await ensureIndexes()
  const db = await getDatabase()

  const stored = await db.collection("social_brand_kits").findOne({ ownerId })
  if (stored) {
    return toBrandKit({
      ownerId,
      companyName: stored.companyName as string | undefined,
      logoUrl: stored.logoUrl as string | undefined,
      primaryColor: stored.primaryColor as string | undefined,
      secondaryColor: stored.secondaryColor as string | undefined,
      accentColor: stored.accentColor as string | undefined,
      updatedAt: stored.updatedAt as Date,
    })
  }

  const [companyName, logoUrl] = await Promise.all([
    resolveCompanyName(ownerId),
    resolveLogoUrl(ownerId),
  ])

  return {
    ownerId,
    companyName,
    logoUrl,
    primaryColor: DEFAULT_PRIMARY,
    secondaryColor: DEFAULT_SECONDARY,
    accentColor: DEFAULT_ACCENT,
    updatedAt: new Date(),
  }
}

export async function updateBrandKit(
  ownerId: string,
  input: UpdateBrandKitInput
): Promise<SocialBrandKit> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()

  const existing = await getBrandKit(ownerId)

  const doc = {
    ownerId,
    companyName: input.companyName?.trim() || existing.companyName,
    logoUrl:
      input.logoUrl === null
        ? undefined
        : input.logoUrl?.trim() || existing.logoUrl,
    primaryColor: input.primaryColor?.trim() || existing.primaryColor,
    secondaryColor: input.secondaryColor?.trim() || existing.secondaryColor,
    accentColor: input.accentColor?.trim() || existing.accentColor,
    updatedAt: now,
  }

  await db.collection("social_brand_kits").updateOne(
    { ownerId },
    { $set: doc },
    { upsert: true }
  )

  return toBrandKit(doc)
}
