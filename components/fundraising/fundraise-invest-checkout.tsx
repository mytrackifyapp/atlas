"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, Smartphone, Wallet } from "lucide-react"
import { toast } from "sonner"
import type { Address } from "viem"

import { PaymentQrCode } from "@/components/checkout/payment-qr-code"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CHECKOUT_CHAINS, getChainConfig } from "@/lib/checkout/chains"
import { connectCheckoutWallet, sendStablecoinTransfer } from "@/lib/checkout/wallet-client"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"
import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"
import { cn } from "@/lib/utils"

type FundraiseInfo = {
  id: string
  roundType: string
  targetAmount: number
  committedAmount: number
  minInvestment: number | null
  maxInvestment: number | null
  receivingWalletAddress: string | null
  investReady?: boolean
}

type IntentPayload = {
  id: string
  payerUserId: string
  fundraiseId: string
  amountUsd: number
  amountDisplay: string
  amountAtomic: string
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  treasuryAddress: string
  tokenAddress: string
  chainLabel: string
  expiresAt: string
  roundType: string
}

type Props = {
  fundraise: FundraiseInfo
  settingsHref?: string
  backHref?: string
  publicMode?: boolean
  investorUi?: boolean
  hideBack?: boolean
}

type Step = "amount" | "pay" | "confirming" | "success"

function buildAmountPresets(min: number | null, max: number | null) {
  const base = [500, 1000, 2500, 5000, 10000, 25000]
  return base.filter((n) => (min ? n >= min : true) && (max ? n <= max : true)).slice(0, 4)
}

export function FundraiseInvestCheckout({
  fundraise,
  settingsHref = "/founder/settings",
  backHref = "/founder/fundraising",
  publicMode = false,
  investorUi = false,
  hideBack = false,
}: Props) {
  const [payerUserId, setPayerUserId] = useState<string | null>(null)
  const [amountUsd, setAmountUsd] = useState("")
  const [stablecoin, setStablecoin] = useState<CheckoutStablecoin>("USDC")
  const [chainId, setChainId] = useState<CheckoutChainId>("base")
  const [walletAddress, setWalletAddress] = useState<Address | null>(null)
  const [intent, setIntent] = useState<IntentPayload | null>(null)
  const [txHash, setTxHash] = useState("")
  const [step, setStep] = useState<Step>("amount")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chain = useMemo(() => getChainConfig(chainId), [chainId])
  const parsedAmount = Number(amountUsd)
  const amountPresets = useMemo(
    () => buildAmountPresets(fundraise.minInvestment, fundraise.maxInvestment),
    [fundraise.minInvestment, fundraise.maxInvestment],
  )

  const cardClass = investorUi
    ? "rounded-2xl border-0 bg-transparent p-0 shadow-none"
    : "rounded-2xl border-neutral-200/80 p-5 dark:border-neutral-800"

  useEffect(() => {
    if (publicMode) return
    fetch("/api/user/wallet", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { wallet?: { address: string } } | null) => {
        if (data?.wallet?.address) {
          setWalletAddress(data.wallet.address as Address)
        }
      })
      .catch(() => {})
  }, [publicMode])

  const intentApiBase = publicMode
    ? `/api/fundraise/${fundraise.id}/invest`
    : "/api/founder/fundraise/invest"

  useEffect(() => {
    if (!intent?.id || !payerUserId || (step !== "pay" && step !== "confirming")) return

    const intentId = intent.id
    const payerId = payerUserId
    let cancelled = false

    async function watchPayment() {
      try {
        const watchUrl = publicMode
          ? `${intentApiBase}/watch?intentId=${intentId}&payerUserId=${encodeURIComponent(payerId)}`
          : `${intentApiBase}/watch?intentId=${intentId}`
        const res = await fetch(watchUrl, { cache: "no-store" })
        const data = (await res.json()) as { status?: string; txHash?: string }
        if (cancelled || !res.ok) return
        if (data.status === "confirmed") {
          if (data.txHash) setTxHash(data.txHash)
          setStep("success")
          setError(null)
          toast.success("Investment confirmed")
        }
      } catch {
        // keep polling
      }
    }

    void watchPayment()
    const timer = window.setInterval(watchPayment, 5000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [intent?.id, payerUserId, step, intentApiBase, publicMode])

  const createIntent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${intentApiBase}/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          publicMode
            ? {
                amountUsd: parsedAmount,
                stablecoin,
                chainId,
              }
            : {
                fundraiseId: fundraise.id,
                amountUsd: parsedAmount,
                stablecoin,
                chainId,
              },
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start investment")
      setIntent(data.intent)
      setPayerUserId(data.intent.payerUserId)
      setStep("pay")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start investment")
    } finally {
      setLoading(false)
    }
  }, [fundraise.id, parsedAmount, stablecoin, chainId, intentApiBase, publicMode])

  async function payWithWallet() {
    if (!intent) return
    setLoading(true)
    setError(null)
    setStep("confirming")
    try {
      const { address } = await connectCheckoutWallet(chain)
      setWalletAddress(address)
      const hash = await sendStablecoinTransfer({
        chain,
        tokenAddress: intent.tokenAddress as Address,
        treasuryAddress: intent.treasuryAddress as Address,
        amountAtomic: BigInt(intent.amountAtomic),
        fromAddress: address,
        stablecoin: intent.stablecoin,
        amountDisplay: intent.amountDisplay,
      })
      setTxHash(hash)
      await confirmPayment(hash, address)
    } catch (e) {
      setStep("pay")
      setError(
        formatCheckoutWalletError(e, {
          stablecoin: intent.stablecoin,
          amountDisplay: intent.amountDisplay,
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  async function confirmPayment(hash: string, payer?: Address) {
    if (!intent || !payerUserId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${intentApiBase}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: intent.id,
          payerUserId,
          txHash: hash,
          payerAddress: payer ?? walletAddress ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not verify payment")
      setStep("success")
      toast.success("Investment confirmed")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed")
      setStep("pay")
    } finally {
      setLoading(false)
    }
  }

  function copyText(text: string, label: string) {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const walletReady = fundraise.investReady || Boolean(fundraise.receivingWalletAddress)

  if (!walletReady) {
    return (
      <Card className="rounded-2xl border-neutral-200/80 p-6 dark:border-neutral-800">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {publicMode
            ? "This round is not accepting investments yet."
            : "Connect a wallet in Settings to receive USDC/USDT investments directly to your wallet."}
        </p>
        {!publicMode ? (
          <Button asChild className="mt-4 rounded-full">
            <Link href={settingsHref}>Connect wallet in Settings</Link>
          </Button>
        ) : null}
      </Card>
    )
  }

  if (step === "success") {
    return (
      <Card className="rounded-2xl border-[#c1ff72]/40 bg-[#c1ff72]/10 p-8 text-center dark:border-[#c1ff72]/20">
        <Check className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-4 text-xl font-semibold">Investment received</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {intent?.amountDisplay} {intent?.stablecoin} has been verified on-chain.
        </p>
        {!hideBack ? (
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href={backHref}>Back to fundraising</Link>
          </Button>
        ) : null}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!hideBack ? (
        <Button variant="ghost" size="sm" asChild className="text-neutral-500">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Card className={cardClass}>
        {step === "amount" ? (
          <div className="space-y-5">
            {!investorUi ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Round</p>
                <p className="text-lg font-semibold">{fundraise.roundType}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label className={investorUi ? "text-sm font-semibold text-neutral-800 dark:text-neutral-200" : undefined}>
                How much do you want to invest?
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                  $
                </span>
                <Input
                  type="number"
                  min={fundraise.minInvestment ?? 1}
                  max={fundraise.maxInvestment ?? undefined}
                  step="0.01"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  placeholder={
                    fundraise.minInvestment
                      ? `${fundraise.minInvestment.toLocaleString()}`
                      : "5,000"
                  }
                  className={cn(
                    "h-12 text-base font-semibold tabular-nums",
                    investorUi && "rounded-xl border-neutral-200/70 bg-neutral-100/50 pl-7 text-neutral-800 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-950",
                  )}
                />
              </div>
              {amountPresets.length > 0 && investorUi ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {amountPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountUsd(String(preset))}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors",
                        amountUsd === String(preset)
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-950"
                          : "border-neutral-200/70 bg-neutral-100/40 text-neutral-600 hover:border-neutral-300/80 hover:bg-neutral-100/60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400",
                      )}
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              ) : null}
              {fundraise.minInvestment ? (
                <p className="text-xs text-neutral-500">
                  Min ${fundraise.minInvestment.toLocaleString()}
                  {fundraise.maxInvestment
                    ? ` · Max $${fundraise.maxInvestment.toLocaleString()}`
                    : ""}
                </p>
              ) : null}
            </div>

            <div>
              <Label className={cn(
                investorUi ? "text-sm font-semibold text-neutral-800 dark:text-neutral-200" : "text-xs uppercase tracking-wide text-neutral-400",
              )}>
                Pay with
              </Label>
              <div className="mt-2 flex gap-2">
                {(["USDC", "USDT"] as CheckoutStablecoin[]).map((coin) => (
                  <button
                    key={coin}
                    type="button"
                    onClick={() => setStablecoin(coin)}
                    className={cn(
                      "flex-1 rounded-full border px-3 py-2 text-sm font-semibold",
                      stablecoin === coin
                        ? "border-[#c1ff72]/50 bg-[#c1ff72]/10"
                        : "border-neutral-200/70 bg-neutral-100/30 dark:border-neutral-800",
                    )}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className={cn(
                investorUi ? "text-sm font-semibold text-neutral-800 dark:text-neutral-200" : "text-xs uppercase tracking-wide text-neutral-400",
              )}>
                Network
              </Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(Object.keys(CHECKOUT_CHAINS) as CheckoutChainId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChainId(id)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-sm font-medium",
                      chainId === id
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                        : "border-neutral-200/70 bg-neutral-100/30 dark:border-neutral-800",
                    )}
                  >
                    {CHECKOUT_CHAINS[id].shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className={cn(
                "h-12 w-full rounded-full font-semibold",
                investorUi
                  ? "bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]"
                  : "bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]",
              )}
              disabled={loading || !parsedAmount || parsedAmount <= 0}
              onClick={() => void createIntent()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to payment"}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-950">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Send exactly</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {intent?.amountDisplay} {intent?.stablecoin}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                on {intent?.chainLabel} · {fundraise.roundType} round
              </p>
            </div>

            {(step === "pay" || step === "confirming") && (
              <div className="flex items-center gap-2 rounded-xl border border-[#c1ff72]/40 bg-[#c1ff72]/10 px-4 py-3">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <p className="text-sm">
                  {step === "confirming"
                    ? "Confirming on-chain…"
                    : "Watching for your payment — we'll confirm automatically once it lands"}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-neutral-200/80 p-4 dark:border-neutral-800">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium">
                <Smartphone className="h-4 w-4 text-neutral-500" />
                Pay from your wallet
              </div>
              <PaymentQrCode value={intent!.treasuryAddress.toLowerCase()} />
              <div className="mt-4 flex gap-2">
                <Input readOnly value={intent!.treasuryAddress} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyText(intent!.treasuryAddress, "Address")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
              disabled={loading || step === "confirming"}
              onClick={() => void payWithWallet()}
            >
              {step === "confirming" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Pay with wallet
                </>
              )}
            </Button>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-xs text-neutral-500">Already sent? Paste transaction hash</Label>
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
                  onClick={() => void confirmPayment(txHash.trim())}
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
