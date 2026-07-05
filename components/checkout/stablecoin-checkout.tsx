"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Shield,
  Smartphone,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import type { Address } from "viem"

import { PageHeader } from "@/components/page-header"
import { PaymentQrCode } from "@/components/checkout/payment-qr-code"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AI_CREDIT_PACKS,
  CREDIT_PACK_IDS,
  getCheckoutPlanSummary,
  getCreditPackSummary,
  isCheckoutPlanId,
  isCreditPackId,
  type CheckoutPlanId,
  type CreditPackId,
} from "@/lib/checkout/catalog"
import { CHECKOUT_CHAINS, getChainConfig } from "@/lib/checkout/chains"
import { connectCheckoutWallet, sendStablecoinTransfer } from "@/lib/checkout/wallet-client"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"
import type { BillingInterval } from "@/lib/pricing-plans"
import type { CheckoutChainId, CheckoutKind, CheckoutStablecoin } from "@/lib/checkout/types"
import { cn } from "@/lib/utils"

type IntentPayload = {
  id: string
  kind: CheckoutKind
  planId?: CheckoutPlanId
  billingInterval?: BillingInterval
  creditPackId?: CreditPackId
  creditsAmount?: number
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  amountUsd: number
  amountDisplay: string
  amountAtomic: string
  treasuryAddress: string
  tokenAddress: string
  payerAddress?: string
  status: string
  expiresAt: string
  chainLabel: string
}

type Step = "configure" | "pay" | "confirming" | "success"

type Props = {
  settingsHref: string
  agentsHubHref: string
}

export function StablecoinCheckout({ settingsHref, agentsHubHref }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPlan = searchParams.get("plan") ?? "pro"
  const initialInterval = (searchParams.get("interval") ?? "annual") as BillingInterval
  const initialPack = searchParams.get("pack") ?? "pack_500"
  const checkoutMode: CheckoutKind =
    searchParams.get("mode") === "credits" ? "credits" : "subscription"

  const [planId, setPlanId] = useState<CheckoutPlanId>(
    isCheckoutPlanId(initialPlan) ? initialPlan : "pro",
  )
  const [creditPackId, setCreditPackId] = useState<CreditPackId>(
    isCreditPackId(initialPack) ? initialPack : "pack_500",
  )
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    initialInterval === "monthly" ? "monthly" : "annual",
  )
  const [stablecoin, setStablecoin] = useState<CheckoutStablecoin>("USDC")
  const [chainId, setChainId] = useState<CheckoutChainId>("base")
  const [configured, setConfigured] = useState(true)
  const [walletAddress, setWalletAddress] = useState<Address | null>(null)
  const [hasSavedWallet, setHasSavedWallet] = useState(false)
  const [intent, setIntent] = useState<IntentPayload | null>(null)
  const [txHash, setTxHash] = useState("")
  const [step, setStep] = useState<Step>("configure")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summary = useMemo(() => {
    if (checkoutMode === "credits") {
      return getCreditPackSummary(creditPackId)
    }
    return getCheckoutPlanSummary(planId, billingInterval)
  }, [checkoutMode, creditPackId, planId, billingInterval])

  const chain = useMemo(() => getChainConfig(chainId), [chainId])

  useEffect(() => {
    fetch("/api/checkout/intent")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false))
  }, [])

  useEffect(() => {
    fetch("/api/user/wallet", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { wallet?: { address: string } } | null) => {
        if (data?.wallet?.address) {
          setWalletAddress(data.wallet.address as Address)
          setHasSavedWallet(true)
        }
      })
      .catch(() => {})
  }, [])

  const paymentSuccessMessage =
    checkoutMode === "credits"
      ? "Payment confirmed — credits added to your balance"
      : "Payment confirmed — your plan is active"

  useEffect(() => {
    if (!intent?.id || (step !== "pay" && step !== "confirming")) return

    const intentId = intent.id
    let cancelled = false

    async function watchPayment() {
      try {
        const params = new URLSearchParams({ intentId })

        const res = await fetch(`/api/checkout/watch?${params}`, { cache: "no-store" })
        const data = (await res.json()) as { status?: string; txHash?: string }
        if (cancelled || !res.ok) return

        if (data.status === "confirmed") {
          if (data.txHash) setTxHash(data.txHash)
          setStep("success")
          setError(null)
          toast.success(paymentSuccessMessage)
        } else if (data.status === "expired") {
          setError("This checkout session has expired. Start a new payment.")
          setStep("configure")
        }
      } catch {
        // Keep polling on transient network errors.
      }
    }

    void watchPayment()
    const timer = window.setInterval(watchPayment, 5000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [intent?.id, step, paymentSuccessMessage])

  const createIntent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const body =
        checkoutMode === "credits"
          ? {
              kind: "credits" as const,
              creditPackId,
              stablecoin,
              chainId,
            }
          : {
              kind: "subscription" as const,
              planId,
              billingInterval,
              stablecoin,
              chainId,
            }

      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start checkout")
      setIntent(data.intent)
      setStep("pay")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout")
    } finally {
      setLoading(false)
    }
  }, [checkoutMode, planId, billingInterval, creditPackId, stablecoin, chainId])

  async function connectWallet() {
    setLoading(true)
    setError(null)
    try {
      const { address } = await connectCheckoutWallet(chain)
      setWalletAddress(address)
      toast.success("Wallet connected")
    } catch (e) {
      setError(formatCheckoutWalletError(e))
    } finally {
      setLoading(false)
    }
  }

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
    if (!intent) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: intent.id,
          txHash: hash,
          payerAddress: payer ?? walletAddress ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not verify payment")
      setStep("success")
      toast.success(paymentSuccessMessage)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed")
      setStep("pay")
    } finally {
      setLoading(false)
    }
  }

  function copyText(value: string, label: string) {
    void navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <Shield className="mx-auto h-10 w-10 text-neutral-400" />
        <h1 className="text-xl font-semibold">Stablecoin checkout unavailable</h1>
        <p className="text-sm text-neutral-500">
          Treasury addresses are not configured yet. Contact support to complete payment.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/pricing">Back to pricing</Link>
        </Button>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#c1ff72]/20">
          <Check className="h-7 w-7 text-[#5a8f1e]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Payment confirmed</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {checkoutMode === "credits" ? (
              <>
                {summary.kind === "credits"
                  ? `${summary.credits.toLocaleString()} AI credits`
                  : "Your credits"}{" "}
                have been added to your balance.
              </>
            ) : (
              <>
                Your {summary.kind === "subscription" ? summary.planName : ""} plan is active. AI
                credits have been refreshed for this billing period.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            className="rounded-full bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]"
            onClick={() => router.push(settingsHref)}
          >
            View settings
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={agentsHubHref}>Open AI hub</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageHeader
        title={checkoutMode === "credits" ? "Buy AI credits" : "Checkout"}
        description={
          checkoutMode === "credits"
            ? "Top up your balance with a one-time USDT or USDC purchase on Base, Polygon, or Ethereum."
            : "Pay with USDT or USDC on Base, Polygon, or Ethereum. Your plan activates after on-chain verification."
        }
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link
              href={
                checkoutMode === "credits"
                  ? settingsHref
                  : "/pricing"
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {checkoutMode === "credits" ? "Settings" : "Pricing"}
            </Link>
          </Button>
        }
      />

      {error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border-neutral-200/80 p-5 shadow-none dark:border-neutral-800">
          {step === "configure" ? (
            <div className="space-y-5">
              {checkoutMode === "credits" ? (
                <div>
                  <Label className="text-xs uppercase tracking-wide text-neutral-400">
                    Credit pack
                  </Label>
                  <div className="mt-2 space-y-2">
                    {CREDIT_PACK_IDS.map((id) => {
                      const pack = AI_CREDIT_PACKS[id]
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setCreditPackId(id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                            creditPackId === id
                              ? "border-[#c1ff72]/50 bg-[#c1ff72]/10"
                              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800",
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold">{pack.label}</p>
                            <p className="text-xs text-neutral-500">{pack.description}</p>
                          </div>
                          <span className="text-sm font-semibold tabular-nums">${pack.priceUsd}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-neutral-400">Plan</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(["pro", "team"] as CheckoutPlanId[]).map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPlanId(id)}
                          className={cn(
                            "rounded-xl border px-3 py-3 text-left transition-colors",
                            planId === id
                              ? "border-[#c1ff72]/50 bg-[#c1ff72]/10"
                              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800",
                          )}
                        >
                          <p className="text-sm font-semibold capitalize">{id}</p>
                          <p className="text-xs text-neutral-500">
                            {id === "pro" ? "500 credits/mo" : "2,500 credits/mo"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wide text-neutral-400">Billing</Label>
                    <div className="mt-2 flex gap-2">
                      {(["monthly", "annual"] as BillingInterval[]).map((interval) => (
                        <button
                          key={interval}
                          type="button"
                          onClick={() => setBillingInterval(interval)}
                          className={cn(
                            "flex-1 rounded-full border px-3 py-2 text-sm font-medium capitalize",
                            billingInterval === interval
                              ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                              : "border-neutral-200 text-neutral-600 dark:border-neutral-800",
                          )}
                        >
                          {interval}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="text-xs uppercase tracking-wide text-neutral-400">Stablecoin</Label>
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
                          : "border-neutral-200 dark:border-neutral-800",
                      )}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wide text-neutral-400">Network</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(CHECKOUT_CHAINS) as CheckoutChainId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setChainId(id)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-sm font-medium capitalize",
                        chainId === id
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 dark:border-neutral-800",
                      )}
                    >
                      {CHECKOUT_CHAINS[id].shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="h-11 w-full rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
                disabled={loading}
                onClick={() => void createIntent()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to payment"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Send exactly
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {intent?.amountDisplay} {intent?.stablecoin}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  on {intent?.chainLabel} · ≈ ${intent?.amountUsd} USD
                </p>
              </div>

              {(step === "pay" || step === "confirming") && (
                <div className="flex items-center gap-2 rounded-xl border border-[#c1ff72]/40 bg-[#c1ff72]/10 px-4 py-3 dark:border-[#c1ff72]/20 dark:bg-[#c1ff72]/5">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-700 dark:text-neutral-300" />
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {step === "confirming"
                      ? "Confirming your payment on-chain…"
                      : "Watching for your payment — we'll activate automatically once it lands"}
                  </p>
                </div>
              )}

              {intent?.treasuryAddress ? (
                <div className="rounded-xl border border-neutral-200/80 p-4 dark:border-neutral-800">
                  <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium">
                    <Smartphone className="h-4 w-4 text-neutral-500" />
                    Pay from your phone
                  </div>

                  <ol className="mb-4 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <li className="flex gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white">1.</span>
                      <span>Open your wallet app (MetaMask, Trust Wallet, Coinbase, etc.)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white">2.</span>
                      <span>Tap Send, then scan the QR code below</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white">3.</span>
                      <span>
                        Send exactly {intent.amountDisplay} {intent.stablecoin} on{" "}
                        {intent.chainLabel}
                      </span>
                    </li>
                  </ol>

                  <PaymentQrCode value={intent.treasuryAddress.toLowerCase()} />

                  <div className="mt-4 space-y-2">
                    <Label className="text-xs text-neutral-500">Treasury address</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={intent.treasuryAddress}
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyText(intent.treasuryAddress, "Address")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-xs text-neutral-400">or pay on this device</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>

              <div className={cn("flex flex-col gap-2", hasSavedWallet ? "" : "sm:flex-row")}>
                {!hasSavedWallet ? (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    disabled={loading}
                    onClick={() => void connectWallet()}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {walletAddress
                      ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                      : "Connect wallet"}
                  </Button>
                ) : walletAddress ? (
                  <p className="text-center text-xs text-neutral-500 sm:text-left">
                    Paying from{" "}
                    <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                      {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                    </span>
                  </p>
                ) : null}
                <Button
                  className={cn(
                    "rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]",
                    hasSavedWallet ? "w-full" : "flex-1",
                  )}
                  disabled={loading || step === "confirming"}
                  onClick={() => void payWithWallet()}
                >
                  {step === "confirming" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    "Pay with wallet"
                  )}
                </Button>
              </div>

              <div className="space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <Label className="text-xs text-neutral-500">
                  Already sent? Paste transaction hash
                </Label>
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

              <Button
                variant="ghost"
                className="w-full text-neutral-500"
                onClick={() => {
                  setStep("configure")
                  setIntent(null)
                }}
              >
                Change {checkoutMode === "credits" ? "pack or network" : "plan or network"}
              </Button>
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border-neutral-200/80 p-5 shadow-none dark:border-neutral-800">
          <h2 className="text-sm font-semibold">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            {summary.kind === "credits" ? (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pack</span>
                  <span className="font-medium">{summary.packLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Credits</span>
                  <span className="font-medium">{summary.credits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{summary.amountLabel}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Plan</span>
                  <span className="font-medium">{summary.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Billing</span>
                  <span className="font-medium capitalize">{billingInterval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">AI credits</span>
                  <span className="font-medium">{summary.creditsPerMonth.toLocaleString()} / mo</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{summary.amountLabel}</span>
                </div>
              </>
            )}
          </div>

          <ul className="mt-5 space-y-2 text-xs text-neutral-500">
            <li>· Open your wallet and scan the QR code to get the address</li>
            <li>· Send the exact {stablecoin} amount on the selected network</li>
            <li>· Credits or plan activate automatically once payment is detected</li>
            <li>· Checkout sessions expire in 30 minutes</li>
          </ul>

          {intent?.expiresAt ? (
            <p className="mt-4 text-[11px] text-neutral-400">
              Session expires {new Date(intent.expiresAt).toLocaleTimeString()}
            </p>
          ) : null}

          {txHash ? (
            <a
              href={chain.explorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
            >
              View on explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
