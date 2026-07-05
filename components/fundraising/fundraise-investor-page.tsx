"use client"

import { useEffect, useRef, useState } from "react"
import { Eye, Moon, ShieldCheck, Sparkles, Sun } from "lucide-react"

import { FundraiseInvestCheckout } from "@/components/fundraising/fundraise-invest-checkout"
import { FounderHeaderChip } from "@/components/fundraising/founder-header-chip"
import { FundraiseInvestorProfile } from "@/components/fundraising/fundraise-investor-profile"
import { Button } from "@/components/ui/button"
import type { PublicFundraiseProfile } from "@/lib/fundraising/service"

type Props = {
  profile: PublicFundraiseProfile
  previewMode?: boolean
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

export function FundraiseInvestorPage({ profile, previewMode = false }: Props) {
  const investRef = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  function scrollToInvest() {
    investRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(193,255,114,0.1),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(193,255,114,0.08),transparent)]"
      />

      {previewMode ? (
        <div className="relative border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-950 dark:text-amber-100">
          <span className="inline-flex items-center gap-2 font-medium">
            <Eye className="h-4 w-4" />
            Founder preview — this is what investors see when you share your link
          </span>
        </div>
      ) : null}

      <div className="sticky top-0 z-30 pt-3 sm:pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="rounded-2xl border border-neutral-200/70 bg-[#fafaf8]/92 px-3 py-2 shadow-[0_4px_24px_-14px_rgba(0,0,0,0.12)] backdrop-blur-md sm:rounded-full sm:px-4 sm:py-2.5 dark:border-neutral-800/90 dark:bg-neutral-900/92 dark:shadow-[0_4px_24px_-14px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <FounderHeaderChip
                compact
                className="min-w-0 flex-1 sm:flex-none"
                founder={{
                  founderName: profile.founderName,
                  founderTitle: profile.founderTitle,
                  founderBio: profile.founderBio,
                  founderPhoto: profile.founderPhoto,
                  founderVerified: profile.founderVerified,
                  founderKyc: profile.founderKyc,
                  companyName: profile.companyName,
                }}
              />
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-neutral-300/80 bg-white/80 dark:border-neutral-700 dark:bg-neutral-900"
                  onClick={toggleTheme}
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-10">
          <FundraiseInvestorProfile
            profile={profile}
            formatCurrency={formatCurrency}
            onInvest={profile.canInvest ? scrollToInvest : undefined}
          />

          <aside ref={investRef} className="lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-[#fafaf8] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
              <div className="border-b border-neutral-200/60 bg-gradient-to-br from-[#c1ff72]/10 via-[#fafaf8] to-[#f3f4f1] px-5 py-5 dark:border-neutral-800 dark:from-[#c1ff72]/10 dark:via-neutral-900 dark:to-neutral-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Invest in this round
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">{profile.roundType}</p>
                  </div>
                  <div className="rounded-full bg-[#c1ff72]/25 px-3 py-1 text-xs font-semibold tabular-nums text-neutral-800 dark:text-[#c1ff72]">
                    {profile.percentage}% funded
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-neutral-200/35 px-3 py-2.5 dark:bg-neutral-950">
                    <p className="text-neutral-500">Target</p>
                    <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(profile.targetAmount)}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-200/35 px-3 py-2.5 dark:bg-neutral-950">
                    <p className="text-neutral-500">Min ticket</p>
                    <p className="mt-0.5 font-semibold tabular-nums">
                      {profile.minInvestment ? formatCurrency(profile.minInvestment) : "Any"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {profile.canInvest ? (
                  <FundraiseInvestCheckout
                    publicMode
                    investorUi
                    fundraise={{
                      id: profile.id,
                      roundType: profile.roundType,
                      targetAmount: profile.targetAmount,
                      committedAmount: profile.committedAmount,
                      minInvestment: profile.minInvestment,
                      maxInvestment: profile.maxInvestment,
                      receivingWalletAddress: null,
                      investReady: profile.canInvest,
                    }}
                    hideBack
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Not accepting investments yet
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      The founder still needs to connect a wallet before this round can receive
                      stablecoin payments.
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-neutral-200/55 bg-neutral-100/40 px-3.5 py-3 text-xs leading-relaxed text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Payments are verified on-chain before your investment is recorded. Base,
                    Polygon, and Ethereum supported.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      {profile.canInvest ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/90 bg-white/95 p-4 backdrop-blur-md sm:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
          <Button
            className="h-12 w-full rounded-full bg-[#c1ff72] text-base font-semibold text-neutral-950 hover:bg-[#b4f25f]"
            onClick={scrollToInvest}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Invest with stablecoins
          </Button>
        </div>
      ) : null}
    </div>
  )
}
