"use client"

import Link from "next/link"
import { Copy, ExternalLink, Loader2, QrCode, Share2, Wallet } from "lucide-react"
import { toast } from "sonner"

import { PaymentQrCode } from "@/components/checkout/payment-qr-code"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { FundraisePlatformFeesCard } from "@/components/fundraising/fundraise-platform-fees-card"
import { CHECKOUT_CHAINS } from "@/lib/checkout/chains"
import type { PendingSettlementGroup } from "@/lib/fundraising/platform-fees"
import type { PlatformFee, PlatformFeeSummary } from "@/lib/fundraising/types"
import { cn } from "@/lib/utils"

type FundraiseSummary = {
  id: string
  roundType: string
  targetAmount: number
  committedAmount: number
  percentage: number
  minInvestment: number | null
  maxInvestment: number | null
  daysRemaining: number
  receivingWalletAddress?: string | null
  receivingChainLabel?: string | null
}

type OnChainPayment = {
  id: string
  payerAddress: string
  amountUsd: number
  stablecoin: string
  chainId: string
  txHash: string
}

type Props = {
  fundraise: FundraiseSummary
  onChainPayments: OnChainPayment[]
  platformFeeSummary: PlatformFeeSummary | null
  platformFees: PlatformFee[]
  settlementGroups: PendingSettlementGroup[]
  bindingWallet: boolean
  onBindWallet: () => void
  onFeesSettled?: () => void
  settingsHref?: string
  formatCurrency: (amount: number) => string
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function FundraiseRaisePanel({
  fundraise,
  onChainPayments,
  platformFeeSummary,
  platformFees,
  settlementGroups,
  bindingWallet,
  onBindWallet,
  onFeesSettled,
  settingsHref = "/founder/settings",
  formatCurrency,
}: Props) {
  const investUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invest/${fundraise.id}`
      : `/invest/${fundraise.id}`

  function copyText(text: string, label: string) {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const walletReady = Boolean(fundraise.receivingWalletAddress)
  const remaining = Math.max(0, fundraise.targetAmount - fundraise.committedAmount)

  return (
    <div className="space-y-6">
      {/* Hero — stablecoin raise */}
      <Card className="overflow-hidden border-[#c1ff72]/30 bg-gradient-to-br from-[#c1ff72]/10 via-background to-background">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#c1ff72] text-neutral-950 hover:bg-[#c1ff72]">USDC</Badge>
            <Badge variant="outline">USDT</Badge>
            <Badge variant="secondary">{fundraise.roundType} round</Badge>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Raise in stablecoins
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Investors send USDC or USDT on Base, Polygon, or Ethereum directly to your wallet.
            Payments are verified on-chain and your round updates automatically — no fiat rails.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Raised</p>
                <p className="text-3xl font-bold tabular-nums">
                  {formatCurrency(fundraise.committedAmount)}
                  <span className="ml-2 text-lg font-medium text-muted-foreground">
                    / {formatCurrency(fundraise.targetAmount)}
                  </span>
                </p>
              </div>
              <p className="text-sm font-medium text-primary">{fundraise.percentage}% funded</p>
            </div>
            <Progress value={fundraise.percentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {formatCurrency(remaining)} remaining · {fundraise.daysRemaining} days left in round
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Wallet + share */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your receiving wallet
            </CardTitle>
            <CardDescription>
              All stablecoin investments land in this address. Connect in Settings, then link it to
              your round.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletReady ? (
              <>
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Receiving address
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-medium">
                    {fundraise.receivingWalletAddress}
                  </p>
                  {fundraise.receivingChainLabel ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Linked from {fundraise.receivingChainLabel}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      copyText(fundraise.receivingWalletAddress!, "Wallet address")
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy address
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    disabled={bindingWallet}
                    onClick={onBindWallet}
                  >
                    {bindingWallet ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Refresh from Settings"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Wallet className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Connect MetaMask, Rabby, or Coinbase Wallet in Settings to start accepting
                  USDC/USDT.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link href={settingsHref}>Connect in Settings</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]"
                    disabled={bindingWallet}
                    onClick={onBindWallet}
                  >
                    {bindingWallet ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Link wallet to round"
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Label className="text-xs text-muted-foreground">Investor checkout link</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this link so investors can pay in stablecoins.
              </p>
              <div className="mt-2 flex gap-2">
                <Input readOnly value={investUrl} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyText(investUrl, "Invest link")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full rounded-full"
                asChild
                disabled={!walletReady}
              >
                <Link href={`/invest/${fundraise.id}?preview=1`}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Preview investor checkout
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ticket + networks */}
        <Card>
          <CardHeader>
            <CardTitle>Investment terms</CardTitle>
            <CardDescription>Amounts are denominated in USD; paid in stablecoins 1:1.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Minimum</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {fundraise.minInvestment
                    ? formatCurrency(fundraise.minInvestment)
                    : "No minimum"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Maximum</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {fundraise.maxInvestment
                    ? formatCurrency(fundraise.maxInvestment)
                    : "No cap"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Accepted on
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.values(CHECKOUT_CHAINS)).map((chain) => (
                  <Badge key={chain.id} variant="outline" className="capitalize">
                    {chain.shortLabel}
                  </Badge>
                ))}
              </div>
            </div>

            {walletReady && fundraise.receivingWalletAddress ? (
              <div className="rounded-xl border p-4">
                <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
                  QR for your receiving wallet
                </p>
                <PaymentQrCode value={fundraise.receivingWalletAddress.toLowerCase()} />
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Investors scan, then send USDC or USDT on the chosen network
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {platformFeeSummary ? (
        <FundraisePlatformFeesCard
          summary={platformFeeSummary}
          fees={platformFees}
          settlementGroups={settlementGroups}
          formatCurrency={formatCurrency}
          onSettled={onFeesSettled}
        />
      ) : null}

      {/* Recent stablecoin investments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Stablecoin investments received
          </CardTitle>
          <CardDescription>
            Verified on-chain transfers to your wallet — updates your raised total automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onChainPayments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {walletReady
                ? "No stablecoin investments yet. Share your invest link to get started."
                : "Link your wallet above to start receiving USDC and USDT."}
            </p>
          ) : (
            <ul className="space-y-2">
              {onChainPayments.map((payment) => {
                const chain = CHECKOUT_CHAINS[payment.chainId as keyof typeof CHECKOUT_CHAINS]
                return (
                  <li
                    key={payment.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3",
                    )}
                  >
                    <div>
                      <p className="font-medium tabular-nums">
                        {payment.amountUsd.toLocaleString()} {payment.stablecoin}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        from {shortenAddress(payment.payerAddress)}
                        {chain ? ` · ${chain.shortLabel}` : ""}
                      </p>
                    </div>
                    {chain ? (
                      <a
                        href={chain.explorerTxUrl(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        View transaction
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
