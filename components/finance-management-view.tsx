"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, Plus, Trash2 } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FINANCE_CATEGORIES, categoryIconFor } from "@/lib/finance-categories"

const PIE_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#e11d48", // rose
  "#eab308", // yellow
  "#64748b", // slate
]

type Workspace = {
  id: string
  name: string
  icon?: string
}

type FinanceTransaction = {
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

type FinanceAccount = {
  id: string
  workspaceId: string
  name: string
  subtype?: "savings" | "current"
  currency: string
  balance: number
  institution?: string
  interestRateApr?: number
  goalAmount?: number
  notes?: string
}

type FinanceBudget = {
  id: string
  workspaceId: string
  month: string // YYYY-MM
  category: string
  limit: number
  currency: string
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function FinanceManagementView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")

  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [budgets, setBudgets] = useState<FinanceBudget[]>([])

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  )

  const selectedWorkspace = useMemo(() => {
    if (!selectedAccount) return null
    return workspaces.find((w) => w.id === selectedAccount.workspaceId) ?? null
  }, [selectedAccount, workspaces])

  const monthKey = useMemo(() => {
    const d = new Date()
    const m = `${d.getMonth() + 1}`.padStart(2, "0")
    return `${d.getFullYear()}-${m}`
  }, [])

  async function loadWorkspaces(): Promise<Workspace[]> {
    const res = await fetch("/api/workspace", { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to load workspaces")
    const data = await res.json()
    const ws = (data?.workspaces ?? []) as any[]
    let mapped: Workspace[] = ws.map((w) => ({
      id: w.id,
      name: w.name,
      icon: w.icon,
    }))

    // If none exist, create a default workspace to attach accounts to
    if (!mapped.length) {
      const createRes = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Finance", type: "finance", icon: "💰" }),
      })
      if (!createRes.ok) throw new Error("Failed to create default Finance workspace")
      const created = await createRes.json()
      mapped = [{ id: created.id, name: created.name, icon: created.icon }]
    }

    setWorkspaces(mapped)
    return mapped
  }

  async function loadAccountsForWorkspaces(ws: Workspace[]) {
    const responses = await Promise.all(
      ws.map((w) =>
        fetch(`/api/finance/accounts?workspaceId=${encodeURIComponent(w.id)}`, { cache: "no-store" }),
      ),
    )
    for (const r of responses) {
      if (!r.ok) throw new Error("Failed to load accounts")
    }
    const payloads = await Promise.all(responses.map((r) => r.json()))
    const all: FinanceAccount[] = payloads.flatMap((p) => p?.accounts ?? [])
    setAccounts(all)
    if (!selectedAccountId && all[0]?.id) setSelectedAccountId(all[0].id)
  }

  async function loadFinanceForAccount(account: FinanceAccount) {
    const workspaceId = account.workspaceId
    const [tRes, bRes] = await Promise.all([
      fetch(
        `/api/finance/transactions?workspaceId=${encodeURIComponent(workspaceId)}&accountId=${encodeURIComponent(account.id)}`,
        { cache: "no-store" },
      ),
      fetch(
        `/api/finance/budgets?workspaceId=${encodeURIComponent(workspaceId)}&month=${encodeURIComponent(monthKey)}`,
        { cache: "no-store" },
      ),
    ])
    if (!tRes.ok) throw new Error("Failed to load transactions")
    if (!bRes.ok) throw new Error("Failed to load budgets")
    const tData = await tRes.json()
    const bData = await bRes.json()
    setTransactions(tData?.transactions ?? [])
    setBudgets(bData?.budgets ?? [])
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const ws = await loadWorkspaces()
        if (!cancelled) await loadAccountsForWorkspaces(ws)
        if (!cancelled) setLoading(false)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load")
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!selectedAccountId) return
    ;(async () => {
      try {
        setError(null)
        const account = accounts.find((a) => a.id === selectedAccountId)
        if (!account) return
        await loadFinanceForAccount(account)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load finance")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedAccountId, monthKey, accounts])

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.direction === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = transactions
      .filter((t) => t.direction === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expense, net: income - expense }
  }, [transactions])

  function exportTransactionsCsv() {
    const header = ["date", "direction", "amount", "currency", "category", "description", "accountId"]
    const rows = transactions.map((t) => [
      t.date,
      t.direction,
      `${t.amount}`,
      t.currency,
      t.category,
      t.description.replaceAll('"', '""'),
      t.accountId ?? "",
    ])
    const csv =
      header.join(",") +
      "\n" +
      rows
        .map((r) => r.map((v) => (v.includes(",") || v.includes('"') ? `"${v}"` : v)).join(","))
        .join("\n")

    downloadTextFile(
      `transactions-${selectedAccount?.name?.replaceAll(" ", "-") ?? "account"}.csv`,
      csv,
    )
  }

  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [txDirection, setTxDirection] = useState<"income" | "expense">("expense")
  const [txAmount, setTxAmount] = useState<string>("")
  const [txCurrency, setTxCurrency] = useState("USD")
  const [txCategory, setTxCategory] = useState("Uncategorized")
  const [txCategoryPreset, setTxCategoryPreset] = useState<string>("other")
  const [txDescription, setTxDescription] = useState("")

  async function createTransaction() {
    if (!selectedAccount || !selectedWorkspace) return
    const amount = Number(txAmount)
    const res = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: selectedWorkspace.id,
        date: txDate,
        direction: txDirection,
        amount,
        currency: txCurrency,
        category: txCategory,
        description: txDescription,
        accountId: selectedAccount.id,
      }),
    })
    if (!res.ok) throw new Error("Failed to create transaction")
    setTxDialogOpen(false)
    setTxAmount("")
    setTxCategory("Uncategorized")
    setTxCategoryPreset("other")
    setTxDescription("")
    await loadFinanceForAccount(selectedAccount)
  }

  async function deleteTransaction(id: string) {
    const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete transaction")
    if (selectedAccount) await loadFinanceForAccount(selectedAccount)
  }

  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountName, setAccountName] = useState("")
  const [accountSubtype, setAccountSubtype] = useState<"savings" | "current">("current")
  const [accountCurrency, setAccountCurrency] = useState("USD")
  const [accountBalance, setAccountBalance] = useState("0")
  const [accountInstitution, setAccountInstitution] = useState("")
  const [accountInterestApr, setAccountInterestApr] = useState("")
  const [accountGoalAmount, setAccountGoalAmount] = useState("")
  const [accountNotes, setAccountNotes] = useState("")

  async function createAccount() {
    const wsId = workspaces[0]?.id
    if (!wsId) return
    const res = await fetch("/api/finance/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: wsId,
        name: accountName,
        subtype: accountSubtype,
        currency: accountCurrency,
        balance: Number(accountBalance || "0"),
        institution: accountInstitution,
        interestRateApr:
          accountSubtype === "savings" && accountInterestApr
            ? Number(accountInterestApr)
            : null,
        goalAmount:
          accountSubtype === "savings" && accountGoalAmount
            ? Number(accountGoalAmount)
            : null,
        notes: accountNotes,
      }),
    })
    if (!res.ok) throw new Error("Failed to create account")
    setAccountDialogOpen(false)
    setAccountName("")
    setAccountBalance("0")
    setAccountInstitution("")
    setAccountInterestApr("")
    setAccountGoalAmount("")
    setAccountNotes("")
    await loadAccountsForWorkspaces(workspaces)
  }

  async function deleteAccount(id: string) {
    const res = await fetch(`/api/finance/accounts/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete account")
    await loadAccountsForWorkspaces(workspaces)
    if (selectedAccountId === id) setSelectedAccountId("")
  }

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetMonth, setBudgetMonth] = useState(monthKey)
  const [budgetCategory, setBudgetCategory] = useState("Uncategorized")
  const [budgetCategoryPreset, setBudgetCategoryPreset] = useState<string>("other")
  const [budgetLimit, setBudgetLimit] = useState("")
  const [budgetCurrency, setBudgetCurrency] = useState("USD")

  const workspaceAccounts = useMemo(() => {
    if (!selectedWorkspace) return []
    return accounts.filter((a) => a.workspaceId === selectedWorkspace.id)
  }, [accounts, selectedWorkspace])

  async function createBudget() {
    if (!selectedWorkspace) return
    const res = await fetch("/api/finance/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: selectedWorkspace.id,
        month: budgetMonth,
        category: budgetCategory,
        limit: Number(budgetLimit),
        currency: budgetCurrency,
      }),
    })
    if (!res.ok) throw new Error("Failed to create budget")
    setBudgetDialogOpen(false)
    setBudgetCategory("Uncategorized")
    setBudgetCategoryPreset("other")
    setBudgetLimit("")
    if (selectedAccount) await loadFinanceForAccount(selectedAccount)
  }

  async function deleteBudget(id: string) {
    const res = await fetch(`/api/finance/budgets/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete budget")
    if (selectedAccount) await loadFinanceForAccount(selectedAccount)
  }

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      if (t.direction !== "expense") continue
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [transactions])

  const [focusedCategory, setFocusedCategory] = useState<string | null>(null)

  const spendPieData = useMemo(() => {
    const data = spendByCategory
      .filter(([name]) => (focusedCategory ? name === focusedCategory : true))
      .map(([name, value], idx) => ({
        name,
        value,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }))
    return data
  }, [spendByCategory, focusedCategory])

  const budgetProgress = useMemo(() => {
    const spentMap = new Map<string, number>()
    for (const [cat, spent] of spendByCategory) spentMap.set(cat, spent)
    return budgets
      .map((b) => {
        const spent = spentMap.get(b.category) ?? 0
        const pct = b.limit > 0 ? Math.min(100, Math.round((spent / b.limit) * 100)) : 0
        return { ...b, spent, pct }
      })
      .sort((a, b) => b.pct - a.pct)
  }, [budgets, spendByCategory])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Global Add Account dialog (so the dropdown action always works) */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Account type</Label>
              <Select value={accountSubtype} onValueChange={(v) => setAccountSubtype(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current account</SelectItem>
                  <SelectItem value="savings">Savings account</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Use Current for everyday spend and Savings for interest + goals.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Input value={accountCurrency} onChange={(e) => setAccountCurrency(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Starting balance</Label>
              <Input
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="grid gap-2">
              <Label>Institution (optional)</Label>
              <Input
                value={accountInstitution}
                onChange={(e) => setAccountInstitution(e.target.value)}
                placeholder="e.g. GTBank, Kuda, Stripe Treasury"
              />
            </div>

            {accountSubtype === "savings" ? (
              <>
                <div className="grid gap-2">
                  <Label>Interest rate APR % (optional)</Label>
                  <Input
                    value={accountInterestApr}
                    onChange={(e) => setAccountInterestApr(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 8.5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Savings goal amount (optional)</Label>
                  <Input
                    value={accountGoalAmount}
                    onChange={(e) => setAccountGoalAmount(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 5000"
                  />
                </div>
              </>
            ) : null}

            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Input
                value={accountNotes}
                onChange={(e) => setAccountNotes(e.target.value)}
                placeholder="Any details you want to remember"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await createAccount()
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed")
                }
              }}
              disabled={!accountName}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Add Transaction dialog */}
      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input value={txDate} onChange={(e) => setTxDate(e.target.value)} type="date" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={txDirection} onValueChange={(v) => setTxDirection(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Input value={txCurrency} onChange={(e) => setTxCurrency(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={txCategoryPreset}
                onValueChange={(v) => {
                  setTxCategoryPreset(v)
                  if (v === "__custom__") return
                  if (v === "other") {
                    setTxCategory("Other")
                    return
                  }
                  const match = FINANCE_CATEGORIES.find((c) => c.id === v)
                  if (match) {
                    setTxCategory(match.label)
                    if (match.defaultDirection !== "either") setTxDirection(match.defaultDirection)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FINANCE_CATEGORIES.map((c) => {
                    const Icon = c.icon
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {c.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                  <SelectItem value="__custom__">Custom…</SelectItem>
                </SelectContent>
              </Select>
              {txCategoryPreset === "__custom__" || txCategoryPreset === "other" ? (
                <Input
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  placeholder="Type a category"
                />
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={txDescription} onChange={(e) => setTxDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await createTransaction()
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed")
                }
              }}
              disabled={!selectedAccount || !txAmount || Number.isNaN(Number(txAmount))}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PageHeader
            title="Finance"
            description="Track transactions, budgets, accounts, and reports per workspace."
          />

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => {
                if (!accounts.length) {
                  setAccountDialogOpen(true)
                  return
                }
                if (!selectedAccount) {
                  // pick first account
                  setSelectedAccountId(accounts[0].id)
                }
                setTxDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add transaction
            </Button>
            <Button variant="outline" onClick={exportTransactionsCsv} disabled={!transactions.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={(id) => {
                if (id === "__new_account__") {
                  setAccountDialogOpen(true)
                  return
                }
                setSelectedAccountId(id)
              }}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__new_account__">
                  <span className="flex items-center gap-2 font-medium text-primary">
                    <Plus className="h-4 w-4" />
                    Add new account
                  </span>
                </SelectItem>
                {accounts.map((a) => {
                  const ws = workspaces.find((w) => w.id === a.workspaceId)
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {(ws?.icon ?? "📁") +
                        " " +
                        a.name +
                        (a.subtype ? ` · ${a.subtype === "savings" ? "Savings" : "Current"}` : "")}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="text-muted-foreground">
              Net:{" "}
              <span className={totals.net >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {formatMoney(totals.net, txCurrency)}
              </span>
            </div>
            <div className="text-muted-foreground">
              Income: <span className="text-emerald-600">{formatMoney(totals.income, txCurrency)}</span>
            </div>
            <div className="text-muted-foreground">
              Expense: <span className="text-rose-600">{formatMoney(totals.expense, txCurrency)}</span>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-sm text-muted-foreground">Loading…</Card>
      ) : error ? (
        <Card className="p-6 text-sm text-destructive">{error}</Card>
      ) : !selectedAccountId ? (
        <Card className="p-6 text-sm text-muted-foreground">Create an account to get started.</Card>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-4xl">
              <Card className="p-4">
                <div className="text-xs text-muted-foreground">This month spend</div>
                <div className="mt-1 text-2xl font-semibold">
                  {formatMoney(totals.expense, txCurrency)}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground">Top category</div>
                <div className="mt-1 text-2xl font-semibold">
                  {spendByCategory[0]?.[0] ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {spendByCategory[0]
                    ? formatMoney(spendByCategory[0][1], txCurrency)
                    : "No expenses yet"}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground">Accounts</div>
                <div className="mt-1 text-2xl font-semibold">{workspaceAccounts.length}</div>
              </Card>
            </div>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">Spending by category</div>
                  <div className="text-xs text-muted-foreground">
                    Click a slice or legend item to focus.
                  </div>
                </div>
                {focusedCategory ? (
                  <Button variant="outline" size="sm" onClick={() => setFocusedCategory(null)}>
                    Clear focus
                  </Button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr] items-center">
                <div className="h-[260px] w-full">
                  {spendPieData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value: any, name: any) => [
                            formatMoney(Number(value), txCurrency),
                            String(name),
                          ]}
                        />
                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          onClick={(e: any) => {
                            const name = e?.value as string | undefined
                            if (!name) return
                            setFocusedCategory((cur) => (cur === name ? null : name))
                          }}
                        />
                        <Pie
                          data={spendPieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          onClick={(data: any) => {
                            const name = data?.name as string | undefined
                            if (!name) return
                            setFocusedCategory((cur) => (cur === name ? null : name))
                          }}
                        >
                          {spendPieData.map((entry, index) => (
                            <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-md border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                      No expenses yet.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {(focusedCategory ? spendByCategory.filter(([c]) => c === focusedCategory) : spendByCategory)
                    .slice(0, 8)
                    .map(([cat, amt], idx) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFocusedCategory((cur) => (cur === cat ? null : cat))}
                        className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-foreground">{cat}</span>
                        </span>
                        <span className="font-medium">{formatMoney(amt, txCurrency)}</span>
                      </button>
                    ))}
                  {!spendByCategory.length ? (
                    <div className="text-sm text-muted-foreground">Add an expense to see category breakdown.</div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="font-medium">Budget progress ({monthKey})</div>
              <div className="mt-4 space-y-3">
                {budgetProgress.length ? (
                  budgetProgress.slice(0, 6).map((b) => (
                    <div key={b.id}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">{b.category}</div>
                        <div className="text-muted-foreground">
                          {formatMoney(b.spent, b.currency)} / {formatMoney(b.limit, b.currency)} ({b.pct}
                          %)
                        </div>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={
                            "h-full " +
                            (b.pct >= 100 ? "bg-rose-500" : b.pct >= 80 ? "bg-amber-500" : "bg-emerald-500")
                          }
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No budgets yet.</div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
              </div>
              <Button variant="outline" onClick={() => setTxDialogOpen(true)} disabled={!selectedAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Add transaction
              </Button>
            </div>

            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[56px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length ? (
                    transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{t.date}</TableCell>
                        <TableCell className="text-sm capitalize">{t.direction}</TableCell>
                        <TableCell className="text-sm">
                          <span className="inline-flex items-center gap-2">
                            {(() => {
                              const Icon = categoryIconFor(t.category)
                              return <Icon className="h-4 w-4 text-muted-foreground" />
                            })()}
                            {t.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.description || "—"}</TableCell>
                        <TableCell
                          className={
                            "text-right font-medium " +
                            (t.direction === "income" ? "text-emerald-600" : "text-rose-600")
                          }
                        >
                          {t.direction === "income" ? "+" : "-"}
                          {formatMoney(t.amount, t.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await deleteTransaction(t.id)
                              } catch (e) {
                                setError(e instanceof Error ? e.message : "Failed")
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-sm text-muted-foreground py-8 text-center">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Budgets for <span className="font-medium">{monthKey}</span>
              </div>
              <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add budget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add budget</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Month</Label>
                      <Input value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} placeholder="YYYY-MM" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Select
                        value={budgetCategoryPreset}
                        onValueChange={(v) => {
                          setBudgetCategoryPreset(v)
                          if (v === "__custom__") return
                          if (v === "other") {
                            setBudgetCategory("Other")
                            return
                          }
                          const match = FINANCE_CATEGORIES.find((c) => c.id === v)
                          if (match) setBudgetCategory(match.label)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FINANCE_CATEGORIES.filter((c) => c.defaultDirection !== "income").map((c) => {
                            const Icon = c.icon
                            return (
                              <SelectItem key={c.id} value={c.id}>
                                <span className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  {c.label}
                                </span>
                              </SelectItem>
                            )
                          })}
                          <SelectItem value="__custom__">Custom…</SelectItem>
                        </SelectContent>
                      </Select>
                      {budgetCategoryPreset === "__custom__" || budgetCategoryPreset === "other" ? (
                        <Input
                          value={budgetCategory}
                          onChange={(e) => setBudgetCategory(e.target.value)}
                          placeholder="Type a category"
                        />
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <Label>Limit</Label>
                      <Input value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} inputMode="decimal" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Currency</Label>
                      <Input value={budgetCurrency} onChange={(e) => setBudgetCurrency(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={async () => {
                        try {
                          await createBudget()
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Failed")
                        }
                      }}
                      disabled={!budgetLimit || Number.isNaN(Number(budgetLimit))}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Limit</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="w-[56px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetProgress.length ? (
                    budgetProgress.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.category}</TableCell>
                        <TableCell className="text-right">{formatMoney(b.spent, b.currency)}</TableCell>
                        <TableCell className="text-right">{formatMoney(b.limit, b.currency)}</TableCell>
                        <TableCell className="text-right">{b.pct}%</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await deleteBudget(b.id)
                              } catch (e) {
                                setError(e instanceof Error ? e.message : "Failed")
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-muted-foreground py-8 text-center">
                        No budgets yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{accounts.length} account(s)</div>
              <Button
                variant="outline"
                onClick={() => {
                  setAccountDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add account
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {accounts.length ? (
                accounts.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(a.subtype ? (a.subtype === "savings" ? "Savings" : "Current") : "—") +
                            (a.type ? ` · ${a.type}` : "") +
                            (a.institution ? ` · ${a.institution}` : "")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            await deleteAccount(a.id)
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Failed")
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 text-2xl font-semibold">{formatMoney(a.balance, a.currency)}</div>
                    {(a.subtype === "savings" && (a.interestRateApr || a.goalAmount)) ||
                    (a.subtype === "current" && a.overdraftLimit) ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {a.subtype === "savings" ? (
                          <>
                            {a.interestRateApr != null ? `APR ${a.interestRateApr}%` : null}
                            {a.interestRateApr != null && a.goalAmount != null ? " · " : null}
                            {a.goalAmount != null
                              ? `Goal ${formatMoney(a.goalAmount, a.currency)}`
                              : null}
                          </>
                        ) : (
                          <>
                            {a.overdraftLimit != null
                              ? `Overdraft ${formatMoney(a.overdraftLimit, a.currency)}`
                              : null}
                          </>
                        )}
                      </div>
                    ) : null}
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-sm text-muted-foreground">No accounts yet.</Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

