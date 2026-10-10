import { getDatabase } from "@/lib/db"
import { wewireConfig, wewireRequest, WewireError } from "@/lib/wewire/client"

export type UsBankAccount = {
  id: string
  accountName: string
  accountNumber: string | null
  routingNumber: string | null
  bankName: string | null
  bankAddress: string | null
  iban: string | null
  bic: string | null
  paymentRails: string[]
  currency: string
  status: string
}

type StoredCustomer = {
  userId: string
  subCustomerId: string
  email: string
  type: "BUSINESS" | "INDIVIDUAL"
}

type RequestInput = {
  userId: string
  email: string
  type: "BUSINESS" | "INDIVIDUAL"
  country: string
  businessName?: string
  businessType?: "GENERAL_BUSINESS" | "SOLE_PROPRIETORSHIP"
  firstName?: string
  lastName?: string
  sourceOfFunds: string
  accountPurpose?: string
  tin?: string
  taxResidenceCountry?: string
}

function mapAccount(raw: Record<string, unknown>): UsBankAccount {
  return {
    id: String(raw.id ?? ""),
    accountName: String(raw.accountName ?? ""),
    accountNumber: raw.accountNumber ? String(raw.accountNumber) : null,
    routingNumber: raw.routingNumber ? String(raw.routingNumber) : null,
    bankName: raw.bankName ? String(raw.bankName) : null,
    bankAddress: raw.bankAddress ? String(raw.bankAddress) : null,
    iban: raw.iban ? String(raw.iban) : null,
    bic: raw.bic ? String(raw.bic) : null,
    paymentRails: Array.isArray(raw.paymentRails) ? raw.paymentRails.map(String) : [],
    currency: String(raw.currency ?? "USD"),
    status: String(raw.status ?? "REQUESTED"),
  }
}

async function storedCustomer(userId: string) {
  const db = await getDatabase()
  return db.collection<StoredCustomer>("wewire_subcustomers").findOne({ userId })
}

async function saveCustomer(record: StoredCustomer) {
  const db = await getDatabase()
  await db.collection<StoredCustomer>("wewire_subcustomers").updateOne(
    { userId: record.userId },
    { $set: { ...record, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  )
}

async function listAccounts(subCustomerId: string) {
  const rows = await wewireRequest<Record<string, unknown>[]>(`/v1/subcustomers/${subCustomerId}/accounts`)
  return rows.map(mapAccount)
}

async function kycLink(subCustomerId: string) {
  try {
    const link = await wewireRequest<{ url?: string }>(`/v1/subcustomers/${subCustomerId}/kyc-link`)
    return link.url ?? null
  } catch {
    return null
  }
}

export async function getUsBankAccount(userId: string) {
  const { configured } = wewireConfig()
  const record = await storedCustomer(userId)
  if (!configured || !record?.subCustomerId) {
    return { configured, account: null as UsBankAccount | null, kycUrl: null as string | null }
  }

  const accounts = await listAccounts(record.subCustomerId)
  const account = accounts.find((row) => row.currency === "USD") ?? null
  const needsKyc = account?.status === "DENIED" || !account
  return {
    configured,
    account,
    kycUrl: needsKyc ? await kycLink(record.subCustomerId) : null,
  }
}

export async function requestUsBankAccount(input: RequestInput) {
  const { configured } = wewireConfig()
  if (!configured) throw new WewireError("WeWire is not configured", 503)

  let record = await storedCustomer(input.userId)
  if (!record) {
    const created = await wewireRequest<{ id: string }>("/v1/subcustomers", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        country: input.country,
        type: input.type,
        purpose: ["COLLECTION"],
        referenceId: input.userId,
        ...(input.type === "BUSINESS"
          ? { businessName: input.businessName, businessType: input.businessType ?? "GENERAL_BUSINESS" }
          : { firstName: input.firstName, lastName: input.lastName }),
      }),
    })
    record = { userId: input.userId, subCustomerId: created.id, email: input.email, type: input.type }
    await saveCustomer(record)
  }

  try {
    const issued = await wewireRequest<Record<string, unknown>>(
      `/v1/subcustomers/${record.subCustomerId}/accounts/request`,
      {
        method: "POST",
        body: JSON.stringify({
          currency: "USD",
          sourceOfFunds: input.sourceOfFunds,
          ...(input.accountPurpose ? { account_purpose: input.accountPurpose } : {}),
          ...(input.tin ? { tin: input.tin, taxResidenceCountry: input.taxResidenceCountry } : {}),
        }),
      },
    )
    return { account: mapAccount(issued), kycUrl: null as string | null }
  } catch (error) {
    if (error instanceof WewireError && error.status === 409) {
      const accounts = await listAccounts(record.subCustomerId)
      const account = accounts.find((row) => row.currency === "USD") ?? null
      if (account) return { account, kycUrl: null }
    }
    if (error instanceof WewireError && (error.status === 400 || error.status === 403)) {
      return {
        account: null,
        kycUrl: await kycLink(record.subCustomerId),
        message: "Finish verification with WeWire before this US account can be issued.",
      }
    }
    throw error
  }
}
