"use client"

import { useMemo, useState } from "react"
import { Check, Copy, ExternalLink, Loader2, Receipt, Wallet } from "lucide-react"
import type { Address } from "viem"
import { toast } from "sonner"

import { PaymentQrCode } from "@/components/checkout/payment-qr-code"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CHECKOUT_CHAINS } from "@/lib/checkout/chains"
import { connectCheckoutWallet, sendStablecoinTransfer } from "@/lib/checkout/wallet-client"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"
import type { PendingSettlementGroup } from "@/lib/fundraising/platform-fees"
import type { PlatformFee, PlatformFeeSummary } from "@/lib/fundraising/types"
import { cn } from "@/lib/utils"

type Props = {
  summary: PlatformFeeSummary
  fees: PlatformFee[]
  settlementGroups: PendingSettlementGroup[]
  formatCurrency: (amount: number) => string
  onSettled?: () => void
}

export function FundraisePlatformFeesCard({
  summary,
  fees,
  settlementGroups,
  formatCurrency,
  onSettled,
}: Props) {
  const [activeGroupKey, setActiveGroupKey] = useState(
    () => `${settlementGroups[0]?.chainId ?? "base"}:${settlementGroups[0]?.stablecoin ?? "USDC"}`,
  )
  const [txHash, setTxHash] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const feePercentLabel = `${(summary.feeBps / 100).toFixed(summary.feeBps % 100 === 0 ? 0 : 1)}%`

  const activeGroup = useMemo(
    () =>
      settlementGroups.find((group) => `${group.chainId}:${group.stablecoin}` === activeGroupKey) ??
      settlementGroups[0] ??
      null,
    [settlementGroups, activeGroupKey],
  )

  const chain = activeGroup ? CHECKOUT_CHAINS[activeGroup.chainId] : null

  function copyText(text: string, label: string) {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  async function payWithWallet() {
    if (!activeGroup || !chain) return
    setLoading(true)
    setError(null)
    try {
      const { address } = await connectCheckoutWallet(chain)
      const hash = await sendStablecoinTransfer({
        chain,
        tokenAddress: activeGroup.tokenAddress as Address,
        treasuryAddress: activeGroup.treasuryAddress as Address,
        amountAtomic: BigInt(activeGroup.amountAtomic),
        fromAddress: address,
        stablecoin: activeGroup.stablecoin,
        amountDisplay: activeGroup.amountDisplay,
      })
      setTxHash(hash)
      await submitSettlement(hash)
    } catch (e) {
      setError(
        formatCheckoutWalletError(e, {
          stablecoin: activeGroup.stablecoin,
          amountDisplay: activeGroup.amountDisplay,
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  async function submitSettlement(hash: string) {
    if (!activeGroup) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/founder/fundraise/fees/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: hash,
          chainId: activeGroup.chainId,
          stablecoin: activeGroup.stablecoin,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not verify fee payment")
      toast.success("Platform fees settled")
      setTxHash("")
      onSettled?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Settlement failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-neutral-200/80 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Platform fees
        </CardTitle>
        <CardDescription>
          Trackify charges {feePercentLabel} per stablecoin investment received. Investors pay you in
          full — fees are settled separately to the platform wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due now</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(summary.feesOwedUsd)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.pendingCount} payment{summary.pendingCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(summary.feesPaidUsd)}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rate</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{feePercentLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">on {formatCurrency(summary.grossReceivedUsd)} received</p>
          </div>
        </div>

        {summary.feesOwedUsd > 0 && activeGroup && chain ? (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5">
            {settlementGroups.length > 1 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {settlementGroups.map((group) => {
                  const key = `${group.chainId}:${group.stablecoin}`
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveGroupKey(key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        key === activeGroupKey
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-950"
                          : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900",
                      )}
                    >
                      {group.chainLabel} · {group.stablecoin} · {formatCurrency(group.amountUsd)}
                    </button>
                  )
                })}
              </div>
            ) : null}

            <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
              Settle {formatCurrency(activeGroup.amountUsd)} in {activeGroup.stablecoin}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Send exactly {activeGroup.amountDisplay} {activeGroup.stablecoin} on {activeGroup.chainLabel}{" "}
              to the platform wallet below ({activeGroup.feeCount} fee
              {activeGroup.feeCount === 1 ? "" : "s"}).
            </p>

            <div className="mt-4 flex justify-center">
              <PaymentQrCode value={activeGroup.treasuryAddress.toLowerCase()} />
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Platform wallet</Label>
              <div className="flex gap-2">
                <Input readOnly value={activeGroup.treasuryAddress} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyText(activeGroup.treasuryAddress, "Platform wallet")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#c1ff72] dark:text-neutral-950"
                disabled={loading}
                onClick={() => void payWithWallet()}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Pay with wallet
              </Button>
            </div>

            <div className="mt-4 space-y-2 border-t pt-4">
              <Label className="text-xs text-muted-foreground">Already sent? Paste transaction hash</Label>
              <div className="flex gap-2">
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x…"
                  className="font-mono text-xs"
                />
                <Button
                  variant="secondary"
                  className="shrink-0 rounded-full"
                  disabled={loading || !txHash.trim()}
                  onClick={() => void submitSettlement(txHash.trim())}
                >
                  Verify
                </Button>
              </div>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </div>
        ) : summary.feesOwedUsd === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            <Check className="h-4 w-4 shrink-0" />
            All platform fees for this round are settled.
          </div>
        ) : null}

        {fees.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fee history</p>
            <ul className="space-y-2">
              {fees.slice(0, 8).map((fee) => {
                const explorerChain = CHECKOUT_CHAINS[fee.chainId]
                return (
                  <li
                    key={fee.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium tabular-nums">
                        {formatCurrency(fee.feeAmountUsd)} fee on {formatCurrency(fee.grossAmountUsd)}{" "}
                        investment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fee.stablecoin} on {explorerChain?.shortLabel ?? fee.chainId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={fee.status === "paid" ? "secondary" : "outline"}
                        className={cn(
                          fee.status === "pending" && "border-amber-500/40 text-amber-800 dark:text-amber-200",
                        )}
                      >
                        {fee.status === "paid" ? "Paid" : "Due"}
                      </Badge>
                      {fee.settlementTxHash && explorerChain ? (
                        <a
                          href={explorerChain.explorerTxUrl(fee.settlementTxHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Settlement
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
