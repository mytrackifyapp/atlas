import { getDatabase } from "@/lib/db"
import type { UserWalletRecord, UserWalletSnapshot } from "@/lib/wallets/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("user_wallets").createIndex({ userId: 1 }, { unique: true })
  indexesEnsured = true
}

function toSnapshot(doc: Record<string, unknown>): UserWalletSnapshot {
  return {
    address: String(doc.address),
    chainId: Number(doc.chainId),
    chainLabel: String(doc.chainLabel),
    provider: String(doc.provider),
    nativeBalance: String(doc.nativeBalance ?? "0"),
    nativeSymbol: String(doc.nativeSymbol ?? "ETH"),
    usdcBalance: doc.usdcBalance != null ? String(doc.usdcBalance) : null,
    usdtBalance: doc.usdtBalance != null ? String(doc.usdtBalance) : null,
    connectedAt: new Date(doc.connectedAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  }
}

export async function getUserWallet(userId: string): Promise<UserWalletSnapshot | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const doc = await db.collection("user_wallets").findOne({ userId })
  if (!doc) return null
  return toSnapshot(doc as Record<string, unknown>)
}

export async function saveUserWallet(
  userId: string,
  input: Omit<UserWalletSnapshot, "connectedAt" | "updatedAt">,
): Promise<UserWalletSnapshot> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const existing = await db.collection("user_wallets").findOne({ userId })

  const record: UserWalletRecord = {
    userId,
    ...input,
    connectedAt: existing?.connectedAt
      ? new Date(existing.connectedAt as Date).toISOString()
      : now.toISOString(),
    updatedAt: now.toISOString(),
  }

  await db.collection("user_wallets").updateOne(
    { userId },
    {
      $set: {
        ...record,
        connectedAt: existing?.connectedAt ?? now,
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  return {
    address: record.address,
    chainId: record.chainId,
    chainLabel: record.chainLabel,
    provider: record.provider,
    nativeBalance: record.nativeBalance,
    nativeSymbol: record.nativeSymbol,
    usdcBalance: record.usdcBalance,
    usdtBalance: record.usdtBalance,
    connectedAt: record.connectedAt,
    updatedAt: record.updatedAt,
  }
}

export async function clearUserWallet(userId: string): Promise<void> {
  await ensureIndexes()
  const db = await getDatabase()
  await db.collection("user_wallets").deleteOne({ userId })
}
