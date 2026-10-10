"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AudioLines,
  BookOpen,
  Building2,
  CircleHelp,
  Copy,
  FileText,
  Loader2,
  Mic,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Target,
  Send,
  Sparkles,
  Wallet,
  X,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { toast } from "sonner"

import { AddInvestorDialog } from "@/components/add-investor-dialog"
import { FinnaOrb } from "@/components/finna-orb"
import { FinnaVoiceBeam } from "@/components/finna-voice-beam"
import { EditFundraiseDetailsDialog } from "@/components/fundraising/edit-fundraise-details-dialog"
import { FundraiseRaisePanel } from "@/components/fundraising/fundraise-raise-panel"
import { StartFundraiseDialog } from "@/components/start-fundraise-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinnaVoice } from "@/hooks/use-finna-voice"
import { CHECKOUT_CHAINS } from "@/lib/checkout/chains"
import type { PendingSettlementGroup } from "@/lib/fundraising/platform-fees"
import type { PlatformFee, PlatformFeeSummary } from "@/lib/fundraising/types"
import { cn } from "@/lib/utils"

interface Fundraise {
  id: string
  companyName?: string
  tagline?: string
  website?: string
  headquarters?: string
  teamSize?: string
  executiveSummary?: string
  founderName?: string
  founderTitle?: string
  founderBio?: string
  founderPhoto?: string | null
  demoVideoUrl?: string
  dataRoomUrl?: string
  companyLogo?: string | null
  coverImage?: string | null
  roundType: string
  targetAmount: number
  committedAmount: number
  percentage: number
  preMoneyValuation: number | null
  minInvestment: number | null
  maxInvestment: number | null
  startDate: string | Date
  targetCloseDate: string | Date
  useOfFunds: string[]
  useOfFundsBreakdown: string
  companyDescription: string
  traction: string
  marketOpportunity: string
  competitiveAdvantage: string
  pitchDeck: string | null
  financialModel: string | null
  status: string
  daysRemaining: number
  fundraisingData: Array<{ month: string; raised: number }>
  receivingWalletAddress?: string | null
  receivingChainLabel?: string | null
  createdAt?: string | Date
}

interface OnChainPayment {
  id: string
  payerAddress: string
  amountUsd: number
  stablecoin: string
  chainId: string
  txHash: string
  createdAt: string
}

interface Investor {
  id: string
  name: string
  email?: string
  phone?: string
  firm?: string
  title?: string
  amount: number
  status: string
  stage: string
  notes?: string
  lastContact: string | Date
  avatar?: string
}

interface InvestorStats {
  total: number
  committed: number
  inDiscussion: number
  interested: number
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

function formatDate(date: string | Date) {
  if (!date) return "—"
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(date: string | Date) {
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function LiftedCard({
  header,
  footer,
  children,
}: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#d4d4d4] bg-[#ebebeb] p-1.5 dark:border-white/15 dark:bg-white/[0.08]">
      {header ? <div className="px-3 pb-2 pt-2.5">{header}</div> : null}
      <section className="overflow-hidden rounded-[16px] border border-[#c9cccf] bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(26,26,26,0.08),0_6px_16px_rgba(26,26,26,0.06)] dark:border-white/20 dark:bg-[#171717] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.3)]">
        {children}
      </section>
      {footer ? <div className="-mx-1.5 pt-1">{footer}</div> : null}
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-9 items-center gap-1.5 rounded-full bg-[#f1f2f4] py-1 pl-3 pr-1 dark:bg-white/10">
      <span className="shrink-0 text-sm text-neutral-600 dark:text-neutral-400">{label}:</span>
      <span className="max-w-full truncate rounded-full bg-white px-2.5 py-1 text-sm font-medium text-neutral-950 dark:bg-[#171717] dark:text-white">
        {value}
      </span>
    </div>
  )
}

function JoinRule() {
  return (
    <div className="relative h-3" aria-hidden>
      <div className="absolute inset-x-0 -mx-px top-0 h-3 rounded-t-[14px] border-x border-t border-[#d4d4d4] dark:border-white/15" />
    </div>
  )
}

function SetupRow({
  icon,
  title,
  description,
  action,
  onDismiss,
}: {
  icon: ReactNode
  title: string
  description: string
  action: ReactNode
  onDismiss?: () => void
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 sm:items-center">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-950 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-neutral-500">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        {onDismiss ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={onDismiss} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function FundraisingView() {
  const router = useRouter()
  const [addInvestorOpen, setAddInvestorOpen] = useState(false)
  const [editDetailsOpen, setEditDetailsOpen] = useState(false)
  const [editDetailsTab, setEditDetailsTab] = useState("company")
  const [editDetailsSingle, setEditDetailsSingle] = useState(true)
  const [startFundraiseOpen, setStartFundraiseOpen] = useState(false)
  const [showRaiseDesk, setShowRaiseDesk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fundraise, setFundraise] = useState<Fundraise | null>(null)
  const [onChainPayments, setOnChainPayments] = useState<OnChainPayment[]>([])
  const [platformFeeSummary, setPlatformFeeSummary] = useState<PlatformFeeSummary | null>(null)
  const [platformFees, setPlatformFees] = useState<PlatformFee[]>([])
  const [settlementGroups, setSettlementGroups] = useState<PendingSettlementGroup[]>([])
  const [bindingWallet, setBindingWallet] = useState(false)
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorStats, setInvestorStats] = useState<InvestorStats>({
    total: 0,
    committed: 0,
    inDiscussion: 0,
    interested: 0,
  })
  const [draft, setDraft] = useState("")
  const voice = useFinnaVoice({
    onFinalTranscript: (text) => {
      const next = [draft, text].filter(Boolean).join(" ").trim()
      setDraft(next)
    },
  })

  const fetchFundraise = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/founder/fundraise")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch fundraise")
      }

      if (result.success) {
        setFundraise(result.fundraise)
        setOnChainPayments(result.payments ?? [])
        setPlatformFeeSummary(result.platformFees?.summary ?? null)
        setPlatformFees(result.platformFees?.fees ?? [])
        setSettlementGroups(result.platformFees?.settlementGroups ?? [])
      }
    } catch (err) {
      console.error("Error fetching fundraise:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }, [])

  const fetchInvestors = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/founder/investors")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch investors")
      }

      if (result.success) {
        setInvestors(result.investors || [])
        setInvestorStats(result.stats || { total: 0, committed: 0, inDiscussion: 0, interested: 0 })
      }
    } catch (err) {
      console.error("Error fetching investors:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchFundraise(), fetchInvestors()])
      setLoading(false)
    }
    loadData()
  }, [fetchFundraise, fetchInvestors])

  const handleInvestorAdded = () => {
    fetchInvestors()
    fetchFundraise()
  }

  async function bindReceivingWallet() {
    setBindingWallet(true)
    try {
      const res = await fetch("/api/founder/fundraise/wallet", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to connect wallet")
      toast.success("Receiving wallet linked")
      await fetchFundraise()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect wallet")
    } finally {
      setBindingWallet(false)
    }
  }

  const investUrl = fundraise
    ? typeof window !== "undefined"
      ? `${window.location.origin}/invest/${fundraise.id}`
      : `/invest/${fundraise.id}`
    : ""

  const askFinna = (text?: string) => {
    const query = (text ?? draft).trim()
    if (!query) {
      router.push("/finna")
      return
    }
    router.push(`/finna?q=${encodeURIComponent(query)}`)
  }

  const activity = useMemo(() => {
    const items: Array<{ id: string; title: string; at: Date }> = []

    onChainPayments.forEach((payment) => {
      items.push({
        id: `pay-${payment.id}`,
        title: `Received ${payment.amountUsd.toLocaleString()} ${payment.stablecoin} from ${shortenAddress(payment.payerAddress)}`,
        at: new Date(payment.createdAt),
      })
    })

    investors.forEach((investor) => {
      items.push({
        id: `inv-${investor.id}`,
        title: `${investor.name} is ${investor.status.toLowerCase()}${investor.amount ? ` · ${formatCurrency(investor.amount)}` : ""}`,
        at: new Date(investor.lastContact),
      })
    })

    if (fundraise?.receivingWalletAddress) {
      items.push({
        id: "wallet",
        title: "Receiving wallet linked to this round",
        at: fundraise.createdAt ? new Date(fundraise.createdAt) : new Date(),
      })
    }

    return items
      .filter((item) => !Number.isNaN(item.at.getTime()))
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 6)
  }, [fundraise, investors, onChainPayments])

  const walletReady = Boolean(fundraise?.receivingWalletAddress)

  function openDetails(tab: string) {
    if (!fundraise) {
      setStartFundraiseOpen(true)
      return
    }
    setEditDetailsTab(tab)
    setEditDetailsSingle(true)
    setEditDetailsOpen(true)
  }

  const detailsRows = [
    {
      id: "company",
      icon: <Building2 className="h-4 w-4" />,
      title: "Company",
      description: "Logo, name, website, and the startup image on your investor page.",
    },
    {
      id: "story",
      icon: <BookOpen className="h-4 w-4" />,
      title: "Story",
      description: "Pitch narrative, traction, market, and why you win.",
    },
    {
      id: "round",
      icon: <Target className="h-4 w-4" />,
      title: "Round",
      description: "Round type, target, valuation, ticket size, and close date.",
    },
    {
      id: "materials",
      icon: <FileText className="h-4 w-4" />,
      title: "Materials",
      description: "Pitch deck, financial model, data room, and demo.",
    },
  ]

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6 pb-28">
      <StartFundraiseDialog
        open={startFundraiseOpen}
        onOpenChange={setStartFundraiseOpen}
        onSuccess={fetchFundraise}
      />
      <AddInvestorDialog
        open={addInvestorOpen}
        onOpenChange={setAddInvestorOpen}
        onSuccess={handleInvestorAdded}
      />
      <EditFundraiseDetailsDialog
        open={editDetailsOpen}
        onOpenChange={setEditDetailsOpen}
        fundraise={fundraise}
        initialTab={editDetailsTab}
        singleSection={editDetailsSingle}
        onSuccess={fetchFundraise}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error && !fundraise ? (
        <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#171717]">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <Button onClick={() => { fetchFundraise(); fetchInvestors() }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <LiftedCard
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-neutral-500" />
                    <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Fundraising</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { fetchFundraise(); fetchInvestors() }}
                    aria-label="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              }
              footer={
                !fundraise ? (
                  <div className="px-3 py-4">
                    <p className="text-sm text-neutral-500">No live raise yet. Start one to collect investments and track the pipeline here.</p>
                    <Button className="mt-3 h-8 rounded-full" onClick={() => setStartFundraiseOpen(true)}>
                      Start fundraising
                    </Button>
                  </div>
                ) : (
                  <div className="-mb-1.5">
                    {detailsRows.map((row, index, rows) => (
                        <div key={row.id}>
                          <SetupRow
                            icon={row.icon}
                            title={row.title}
                            description={row.description}
                            action={
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-full"
                                onClick={() => openDetails(row.id)}
                              >
                                Edit
                              </Button>
                            }
                          />
                          {index < rows.length - 1 ? <JoinRule /> : null}
                        </div>
                      ))}
                  </div>
                )
              }
            >
              <div className="grid sm:grid-cols-2">
                <div className="px-5 py-5">
                  <p className="text-sm font-medium">Summary</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {fundraise
                      ? `Finna is tracking your ${fundraise.roundType} round — ${formatCurrency(fundraise.committedAmount)} raised of ${formatCurrency(fundraise.targetAmount)}, ${investorStats.total} investors in the pipeline, and ${fundraise.daysRemaining} days to target close.`
                      : "Start a round to accept USDC and USDT on Base, Polygon, or Ethereum. Finna will help you set up the wallet, pipeline, and materials."}
                  </p>
                </div>
                <div className="border-t border-black/[0.05] px-5 py-5 dark:border-white/10 sm:border-l sm:border-t-0">
                  <p className="text-sm font-medium">Raised to date</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <p className="text-2xl font-semibold tracking-tight">
                      {fundraise ? formatCurrency(fundraise.committedAmount) : "$0"}
                      <span className="ml-2 text-sm font-normal text-neutral-400">
                        {fundraise ? `${fundraise.percentage}%` : "—"}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fundraise?.fundraisingData?.length ? fundraise.fundraisingData : [{ month: "Now", raised: 0 }]}>
                        <Line type="monotone" dataKey="raised" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </LiftedCard>

            <LiftedCard
              header={
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Round configuration</h2>
                  {fundraise ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={() => { setEditDetailsSingle(false); setEditDetailsOpen(true) }} aria-label="Edit terms">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              }
            >
              <div className="px-5 pb-5 pt-4">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                  Channels
                  <CircleHelp className="h-3.5 w-3.5 text-neutral-400" />
                </p>
                <div className="space-y-0.5">
                  {[
                    {
                      label: "Receiving wallet",
                      icon: Wallet,
                      onClick: () => {
                        if (!fundraise) {
                          setStartFundraiseOpen(true)
                          return
                        }
                        if (walletReady) {
                          setShowRaiseDesk(true)
                          return
                        }
                        void bindReceivingWallet()
                      },
                    },
                    {
                      label: "Investors",
                      icon: Sparkles,
                      onClick: () => setAddInvestorOpen(true),
                    },
                    {
                      label: "Pitch deck",
                      icon: FileText,
                      onClick: () => {
                        if (fundraise?.pitchDeck) {
                          window.open(fundraise.pitchDeck, "_blank")
                          return
                        }
                        openDetails("materials")
                      },
                    },
                    {
                      label: "Invest link",
                      icon: Copy,
                      onClick: () => {
                        if (!fundraise) {
                          setStartFundraiseOpen(true)
                          return
                        }
                        void navigator.clipboard.writeText(investUrl)
                        toast.success("Invest link copied")
                      },
                    },
                    {
                      label: "Lounge",
                      icon: Send,
                      onClick: () => router.push("/founder/updates"),
                    },
                  ].map((channel, index) => {
                    const Icon = channel.icon
                    return (
                      <div key={channel.label} className="flex items-center justify-between py-1.5">
                        <span className="flex items-center gap-2.5 text-sm">
                          <Icon className="h-4 w-4 text-neutral-500" />
                          {channel.label}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            index === 0
                              ? "rounded-full border border-[#005bd3] text-[#005bd3] hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400"
                              : "text-neutral-500",
                          )}
                          onClick={channel.onClick}
                          aria-label={`Open ${channel.label}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-black/[0.06] px-5 py-5 dark:border-white/10">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                  Guardrails
                  <CircleHelp className="h-3.5 w-3.5 text-neutral-400" />
                </p>
                <div className="space-y-2">
                  <ConfigRow
                    label="Target close"
                    value={fundraise ? `${formatDate(fundraise.targetCloseDate)} · ${fundraise.daysRemaining} days` : "—"}
                  />
                  <ConfigRow
                    label="Ticket size"
                    value={
                      fundraise
                        ? `${fundraise.minInvestment ? formatCurrency(fundraise.minInvestment) : "No min"} – ${fundraise.maxInvestment ? formatCurrency(fundraise.maxInvestment) : "No cap"}`
                        : "—"
                    }
                  />
                  <ConfigRow
                    label="Networks"
                    value={Object.values(CHECKOUT_CHAINS).map((chain) => chain.shortLabel).join(", ")}
                  />
                </div>
              </div>

              <div className="border-t border-black/[0.06] px-5 py-5 dark:border-white/10">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                  Permissions
                  <CircleHelp className="h-3.5 w-3.5 text-neutral-400" />
                </p>
                <div className="space-y-2">
                  <ConfigRow
                    label="Collect investment"
                    value={walletReady ? "Always allow" : "Wallet required"}
                  />
                  <ConfigRow label="Update round" value="Always allow" />
                  <ConfigRow
                    label="Platform fees"
                    value={
                      platformFeeSummary?.feesOwedUsd
                        ? `${formatCurrency(platformFeeSummary.feesOwedUsd)} pending`
                        : "Settled"
                    }
                  />
                </div>
              </div>
            </LiftedCard>
          </div>

          <section className="px-1">
            <h3 className="text-sm font-medium text-neutral-950 dark:text-white">Activity</h3>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-400">Recent</p>
            {activity.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No activity yet. Connect a wallet or add an investor to get started.</p>
            ) : (
              <ul className="mt-2 divide-y divide-black/[0.04] dark:divide-white/5">
                {activity.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="min-w-0 text-neutral-600 dark:text-neutral-300">{item.title}</span>
                    <span className="shrink-0 tabular-nums text-neutral-400">{formatTime(item.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {showRaiseDesk && fundraise ? (
            <FundraiseRaisePanel
              fundraise={fundraise}
              onChainPayments={onChainPayments}
              platformFeeSummary={platformFeeSummary}
              platformFees={platformFees}
              settlementGroups={settlementGroups}
              bindingWallet={bindingWallet}
              onBindWallet={() => void bindReceivingWallet()}
              onFeesSettled={fetchFundraise}
              formatCurrency={formatCurrency}
            />
          ) : null}
        </>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 px-4 lg:bottom-6">
        <div className="pointer-events-auto mx-auto w-full max-w-xl">
          <FinnaVoiceBeam stream={voice.listening ? voice.stream : null}>
            <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#171717]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <FinnaOrb size={20} />
              </span>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    askFinna()
                  }
                }}
                placeholder="Help me with this raise…"
                className="h-10 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 shrink-0 rounded-full", voice.listening && "text-red-500 hover:text-red-500")}
                onClick={() => void voice.toggle()}
                aria-label={voice.listening ? "Stop listening" : "Voice input"}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
                onClick={() => askFinna()}
                aria-label="Ask Finna"
              >
                <AudioLines className="h-4 w-4" strokeWidth={2.25} />
              </Button>
            </div>
          </FinnaVoiceBeam>
        </div>
      </div>
    </div>
  )
}
