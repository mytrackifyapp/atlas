import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"

export type FinanceAccountSummary = {
  id: string
  workspaceId: string
  name: string
  type: string
  subtype: string | null
  currency: string
  balance: number
  institution: string | null
}

export type FinanceTransactionSummary = {
  id: string
  workspaceId: string
  date: string
  direction: "income" | "expense"
  amount: number
  currency: string
  category: string
  description: string
  accountId: string | null
}

export type RunwaySummary = {
  workspaceId: string
  currency: string
  totalCash: number
  periodDays: number
  totalIncome: number
  totalExpenses: number
  netBurnPerMonth: number
  runwayMonths: number | null
  accountCount: number
  transactionCount: number
  assumptions: string[]
}

async function topWorkspaceIdFromCollection(
  ownerId: string,
  collectionName: "finance_accounts" | "finance_transactions"
): Promise<string | null> {
  const db = await getDatabase()
  const agg = await db
    .collection(collectionName)
    .aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$workspaceId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])
    .toArray()

  const id = agg[0]?._id
  return id != null ? String(id) : null
}

export async function getDefaultFinanceWorkspaceId(
  ownerId: string
): Promise<string | null> {
  const fromAccounts = await topWorkspaceIdFromCollection(ownerId, "finance_accounts")
  if (fromAccounts) return fromAccounts

  const fromTransactions = await topWorkspaceIdFromCollection(
    ownerId,
    "finance_transactions"
  )
  if (fromTransactions) return fromTransactions

  const db = await getDatabase()

  const financeWorkspace = await db.collection("workspaces").findOne(
    { ownerId, type: "finance" },
    { sort: { updatedAt: -1 } }
  )
  if (financeWorkspace?._id) return financeWorkspace._id.toString()

  const anyWorkspace = await db.collection("workspaces").findOne(
    { ownerId },
    { sort: { updatedAt: -1 } }
  )
  return anyWorkspace?._id?.toString() ?? null
}

/** @deprecated Use getDefaultFinanceWorkspaceId */
export async function getDefaultWorkspaceId(ownerId: string): Promise<string | null> {
  return getDefaultFinanceWorkspaceId(ownerId)
}

export async function verifyFinanceWorkspaceAccess(
  ownerId: string,
  workspaceId: string
): Promise<boolean> {
  const db = await getDatabase()

  if (ObjectId.isValid(workspaceId)) {
    const workspace = await db.collection("workspaces").findOne({
      _id: new ObjectId(workspaceId),
      ownerId,
    })
    if (workspace) return true
  }

  const hasAccount = await db.collection("finance_accounts").findOne({
    ownerId,
    workspaceId,
  })
  if (hasAccount) return true

  const hasTransaction = await db.collection("finance_transactions").findOne({
    ownerId,
    workspaceId,
  })
  return Boolean(hasTransaction)
}

export async function resolveFinanceWorkspaceId(
  ownerId: string,
  workspaceId?: string
): Promise<string> {
  if (workspaceId?.trim()) {
    const id = workspaceId.trim()
    const allowed = await verifyFinanceWorkspaceAccess(ownerId, id)
    if (!allowed) {
      throw new Error("Workspace not found or access denied.")
    }
    return id
  }

  const defaultId = await getDefaultFinanceWorkspaceId(ownerId)
  if (!defaultId) {
    throw new Error(
      "No finance data found yet. Add an account in Finance (/founder/finance)."
    )
  }
  return defaultId
}

/** @deprecated Use resolveFinanceWorkspaceId */
export async function resolveWorkspaceId(
  ownerId: string,
  workspaceId?: string
): Promise<string> {
  return resolveFinanceWorkspaceId(ownerId, workspaceId)
}

export async function verifyWorkspaceAccess(
  ownerId: string,
  workspaceId: string
): Promise<boolean> {
  return verifyFinanceWorkspaceAccess(ownerId, workspaceId)
}

export async function listFinanceAccounts(
  ownerId: string,
  workspaceId?: string
): Promise<FinanceAccountSummary[]> {
  const db = await getDatabase()
  const rows = await db
    .collection("finance_accounts")
    .find({
      ownerId,
      ...(workspaceId ? { workspaceId } : {}),
    })
    .sort({ createdAt: 1 })
    .toArray()

  return rows.map((a) => ({
    id: a._id.toString(),
    workspaceId: String(a.workspaceId ?? ""),
    name: String(a.name ?? ""),
    type: String(a.type ?? "bank"),
    subtype: a.subtype ?? null,
    currency: String(a.currency ?? "USD"),
    balance: typeof a.balance === "number" ? a.balance : 0,
    institution: a.institution ?? null,
  }))
}

export async function listFinanceTransactions(
  ownerId: string,
  workspaceId?: string,
  options?: { accountId?: string; limit?: number }
): Promise<FinanceTransactionSummary[]> {
  const db = await getDatabase()
  const limit = options?.limit ?? 100

  const rows = await db
    .collection("finance_transactions")
    .find({
      ownerId,
      ...(workspaceId ? { workspaceId } : {}),
      ...(options?.accountId ? { accountId: options.accountId } : {}),
    })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((t) => ({
    id: t._id.toString(),
    workspaceId: String(t.workspaceId ?? ""),
    date: String(t.date ?? ""),
    direction: t.direction === "income" ? "income" : "expense",
    amount: typeof t.amount === "number" ? t.amount : 0,
    currency: String(t.currency ?? "USD"),
    category: String(t.category ?? "Uncategorized"),
    description: String(t.description ?? ""),
    accountId: t.accountId ?? null,
  }))
}

export async function computeRunway(
  ownerId: string,
  workspaceId?: string,
  periodDays = 90
): Promise<RunwaySummary> {
  const resolvedWorkspaceId =
    workspaceId ?? (await getDefaultFinanceWorkspaceId(ownerId)) ?? ""

  const accounts = await listFinanceAccounts(
    ownerId,
    resolvedWorkspaceId || undefined
  )
  const transactions = await listFinanceTransactions(
    ownerId,
    resolvedWorkspaceId || undefined,
    { limit: 500 }
  )

  const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0)
  const currency = accounts[0]?.currency ?? "USD"

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)

  const recent = transactions.filter((t) => {
    const d = new Date(t.date)
    return !Number.isNaN(d.getTime()) && d >= cutoff
  })

  let totalIncome = 0
  let totalExpenses = 0
  for (const t of recent) {
    if (t.direction === "income") totalIncome += t.amount
    else totalExpenses += t.amount
  }

  const monthsInPeriod = periodDays / 30
  const netBurnPerMonth =
    monthsInPeriod > 0 ? (totalExpenses - totalIncome) / monthsInPeriod : 0

  const runwayMonths =
    netBurnPerMonth > 0 ? totalCash / netBurnPerMonth : null

  const assumptions: string[] = [
    `Cash on hand is the sum of ${accounts.length} account balance(s).`,
    `Burn uses net expenses minus income over the last ${periodDays} days (${recent.length} transactions).`,
  ]

  if (!resolvedWorkspaceId) {
    assumptions.push("Aggregated across all finance workspaces for this user.")
  }

  if (recent.length === 0) {
    assumptions.push("No recent transactions found; runway estimate may be unreliable.")
  }
  if (netBurnPerMonth <= 0) {
    assumptions.push("Net burn is zero or negative; runway is not applicable (cash-flow positive).")
  }

  return {
    workspaceId: resolvedWorkspaceId || "all",
    currency,
    totalCash: Math.round(totalCash * 100) / 100,
    periodDays,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netBurnPerMonth: Math.round(netBurnPerMonth * 100) / 100,
    runwayMonths:
      runwayMonths != null ? Math.round(runwayMonths * 10) / 10 : null,
    accountCount: accounts.length,
    transactionCount: recent.length,
    assumptions,
  }
}
