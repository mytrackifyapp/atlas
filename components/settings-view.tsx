"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import {
  ArrowUpRight,
  Coins,
  CreditCard,
  Loader2,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  User,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { AccountAvatarUpload } from "@/components/account-avatar-upload"
import { FounderVerificationSettings } from "@/components/founder-verification-settings"
import { SettingsWalletSection } from "@/components/settings-wallet-section"
import { VerifiedBadge } from "@/components/verified-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { AI_CREDIT_PLANS } from "@/lib/ai-credits/plans"
import { PRICING_PLANS } from "@/lib/pricing-plans"
import type { AiCreditPlanId } from "@/lib/ai-credits/types"
import { cn } from "@/lib/utils"

type CreditSnapshot = {
  planId: AiCreditPlanId
  planLabel: string
  balance: number
  monthlyAllowance: number
  periodStart: string
  periodEnd: string
  percentUsed: number
}

type Subscription = {
  planId: AiCreditPlanId
  status: string
}

type UsageRow = {
  id: string
  feature: string
  featureLabel: string
  credits: number
  agentId?: string
  description?: string
  createdAt: string
}

function formatPlanPrice(planId: AiCreditPlanId) {
  const plan = PRICING_PLANS.find((p) => p.id === planId)
  if (!plan) return null
  if (plan.priceLabel) return plan.priceLabel
  if (plan.monthlyPrice === 0) return "Free"
  return `$${plan.monthlyPrice}/mo`
}

function SettingsSection({
  title,
  description,
  headerAction,
  children,
  className,
}: {
  title: string
  description?: string
  headerAction?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-neutral-200/80 bg-white p-5 shadow-none sm:p-6 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className={cn("mb-5", headerAction ? "flex items-center justify-between gap-4" : "")}>
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          ) : null}
        </div>
        {headerAction}
      </div>
      {children}
    </Card>
  )
}

export function SettingsView() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [credits, setCredits] = useState<CreditSnapshot | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageRow[]>([])
  const [installedCount, setInstalledCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [founderVerified, setFounderVerified] = useState(false)

  const canVerify =
    session?.user.role === "founder" || session?.user.role === "admin"

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [creditsRes, installedRes, profileRes, verificationRes] = await Promise.all([
        fetch("/api/ai/credits?limit=30", { cache: "no-store" }),
        fetch("/api/ai/installed", { cache: "no-store" }),
        fetch("/api/user/profile", { cache: "no-store" }),
        fetch("/api/user/verification", { cache: "no-store" }),
      ])

      if (!creditsRes.ok) throw new Error("Failed to load account settings")
      const creditsData = (await creditsRes.json()) as {
        credits: CreditSnapshot
        subscription: Subscription
        recentUsage: UsageRow[]
      }
      setCredits(creditsData.credits)
      setSubscription(creditsData.subscription)
      setUsage(creditsData.recentUsage)

      if (installedRes.ok) {
        const installedData = (await installedRes.json()) as {
          installed?: Array<{ agentId: string }>
        }
        setInstalledCount(installedData.installed?.length ?? 0)
      }

      if (profileRes.ok) {
        const profileData = (await profileRes.json()) as {
          profile?: { founderPhoto?: string | null }
        }
        setProfileImage(profileData.profile?.founderPhoto ?? null)
      }

      if (verificationRes.ok) {
        const verificationData = (await verificationRes.json()) as {
          verification?: { verified?: boolean }
        }
        setFounderVerified(Boolean(verificationData.verification?.verified))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  const planConfig = useMemo(
    () => (credits ? AI_CREDIT_PLANS[credits.planId] : null),
    [credits],
  )

  const maxAgents = planConfig?.maxAgents
  const canUpgrade = credits?.planId !== "enterprise"

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.classList.toggle("dark")
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account, wallet, plan, AI credits, and preferences."
      />

      {error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6">
        <SettingsSection
          title="Account"
          headerAction={<SettingsWalletSection align="end" />}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AccountAvatarUpload
                name={session?.user.name}
                image={profileImage ?? session?.user.image}
                onImageUpdated={setProfileImage}
              />
              <div>
                <p className="text-base font-semibold text-neutral-950 dark:text-white">
                  {session?.user.name || "User"}
                </p>
                <p className="text-sm text-neutral-500">{session?.user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    <User className="h-3 w-3" />
                    {session?.user.role === "founder"
                      ? "Founder"
                      : session?.user.role === "admin"
                        ? "Admin"
                        : session?.user.role ?? "Member"}
                  </span>
                  {founderVerified ? <VerifiedBadge compact /> : null}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SettingsSection>

        {canVerify ? (
          <SettingsSection
            title="Become verified"
            description="Complete KYC to earn a verified badge on your public invest page."
          >
            <FounderVerificationSettings onVerified={() => setFounderVerified(true)} />
          </SettingsSection>
        ) : null}

        <SettingsSection
          title="Plan & billing"
          description="Your current subscription and upgrade options."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c1ff72]/20 px-3 py-1 text-sm font-semibold text-neutral-900 dark:text-[#c1ff72]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {credits?.planLabel ?? "Free"} plan
                </span>
                {subscription?.status === "trial" ? (
                  <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 dark:border-neutral-700">
                    Trial
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {formatPlanPrice(credits?.planId ?? "free")}
                {credits?.monthlyAllowance
                  ? ` · ${credits.monthlyAllowance.toLocaleString()} AI credits / month`
                  : ""}
              </p>
              {maxAgents !== null ? (
                <p className="text-xs text-neutral-500">
                  {installedCount} of {maxAgents === 0 ? "0" : maxAgents} AI employees enabled
                  {maxAgents === 0 ? " on Free — upgrade to enable agents" : ""}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  {installedCount} AI employees enabled · unlimited on your plan
                </p>
              )}
            </div>
            {canUpgrade ? (
              <Button
                asChild
                className="rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
              >
                <Link href="/checkout?plan=pro&interval=annual">
                  Upgrade plan
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/contact">Contact sales</Link>
              </Button>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          title="AI credits"
          description="Credits power Finna and your AI employees. Top up anytime or wait for your monthly reset."
        >
          {credits ? (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#c1ff72]/20 blur-2xl" />
                <div className="relative flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Coins className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-[0.12em]">
                        Remaining
                      </span>
                    </div>
                    <p className="mt-1 text-3xl font-semibold tabular-nums text-neutral-950 dark:text-white">
                      {credits.balance.toLocaleString()}
                      <span className="ml-1 text-base font-normal text-neutral-400">
                        / {credits.monthlyAllowance.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-neutral-500">
                    <p>{credits.percentUsed}% used this period</p>
                    <p className="mt-0.5">
                      Resets {format(new Date(credits.periodEnd), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      credits.balance <= 0
                        ? "bg-red-500"
                        : credits.percentUsed >= 80
                          ? "bg-amber-500"
                          : "bg-[#c1ff72]",
                    )}
                    style={{ width: `${Math.max(4, 100 - credits.percentUsed)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  className="rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
                >
                  <Link href="/checkout?mode=credits&pack=pack_500">
                    <Coins className="mr-2 h-4 w-4" />
                    Buy credits
                  </Link>
                </Button>
                {canUpgrade ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/checkout?plan=pro&interval=annual">Upgrade plan</Link>
                  </Button>
                ) : null}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-950 dark:text-white">
                  Recent usage
                </h3>
                {usage.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-800">
                    No AI usage yet. Start a chat with Finna or an AI employee.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {usage.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">
                              {row.featureLabel}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                              {row.agentId ? ` · ${row.agentId.replace("ai-", "")}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 tabular-nums font-medium text-neutral-600 dark:text-neutral-300">
                            −{row.credits}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SettingsSection>

        <SettingsSection title="Preferences">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-950 dark:text-white">Appearance</p>
              <p className="text-xs text-neutral-500">Switch between light and dark mode</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={toggleTheme}>
              {theme === "light" ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark mode
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light mode
                </>
              )}
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Billing & policies">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="outline" className="rounded-full justify-start">
              <Link href="/pricing">
                <CreditCard className="mr-2 h-4 w-4" />
                View all plans
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full justify-start text-neutral-500">
              <Link href="/refund-policy">Refund policy</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full justify-start text-neutral-500">
              <Link href="/privacy">Privacy policy</Link>
            </Button>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
