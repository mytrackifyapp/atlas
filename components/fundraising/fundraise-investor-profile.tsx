"use client"

import Image from "next/image"
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  PlayCircle,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { PublicFundraiseProfile } from "@/lib/fundraising/service"
import { cn } from "@/lib/utils"

type Props = {
  profile: PublicFundraiseProfile
  formatCurrency: (amount: number) => string
  onInvest?: () => void
}

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "traction", label: "Traction" },
  { id: "materials", label: "Materials" },
  { id: "terms", label: "Terms" },
] as const

function DetailBlock({
  title,
  content,
}: {
  title: string
  content?: string | null
}) {
  if (!content?.trim()) return null
  return (
    <div className="space-y-2.5 rounded-2xl border border-neutral-200/60 bg-neutral-100/35 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {title}
      </h4>
      <p className="text-[15px] leading-relaxed text-neutral-700 whitespace-pre-wrap dark:text-neutral-300">
        {content}
      </p>
    </div>
  )
}

function ExternalHref({ href, label }: { href: string; label: string }) {
  const url = href.startsWith("http") ? href : `https://${href}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/70 bg-neutral-100/50 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300/80 hover:bg-neutral-100/80 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
    >
      <Globe className="h-3.5 w-3.5" />
      {label}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </a>
  )
}

function SectionShell({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-3xl border border-neutral-200/70 bg-[#fafaf8] p-6 shadow-[0_8px_30px_-22px_rgba(0,0,0,0.1)] sm:p-7 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-sm"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100/80 dark:bg-neutral-800">
          <Icon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

function MaterialTile({
  icon: Icon,
  title,
  subtitle,
  href,
  external,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  href: string
  external?: boolean
}) {
  const url = external && !href.startsWith("http") ? `https://${href}` : href
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 rounded-2xl border border-neutral-200/60 bg-neutral-100/30 px-4 py-4 transition-colors hover:border-neutral-300/70 hover:bg-neutral-100/50 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fafaf8] shadow-sm dark:bg-neutral-900">
          <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-700" />
    </a>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-neutral-100/40 px-4 py-3 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  )
}

export function FundraiseInvestorProfile({ profile, formatCurrency, onInvest }: Props) {
  const displayName = profile.companyName.trim() || "Fundraising round"
  const initial = displayName.charAt(0).toUpperCase()
  const remaining = Math.max(0, profile.targetAmount - profile.committedAmount)

  const hasAbout = profile.companyDescription || profile.executiveSummary
  const hasTraction =
    profile.traction || profile.marketOpportunity || profile.competitiveAdvantage
  const hasMaterials =
    profile.pitchDeck ||
    profile.financialModel ||
    profile.demoVideoUrl ||
    profile.dataRoomUrl ||
    profile.coverImage

  const visibleSections = SECTIONS.filter((s) => {
    if (s.id === "about") return hasAbout
    if (s.id === "traction") return hasTraction
    if (s.id === "materials") return hasMaterials
    return true
  })

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-[#fafaf8] shadow-[0_12px_40px_-28px_rgba(0,0,0,0.14)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)]">
        {profile.coverImage ? (
          <div className="relative h-32 w-full sm:h-40">
            <Image
              src={profile.coverImage}
              alt={`${displayName} cover`}
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
            {/* Light mode: darken slightly so bright covers aren't blown out — no white wash */}
            <div
              aria-hidden
              className="absolute inset-0 bg-neutral-950/[0.12] dark:bg-black/30"
            />
            {/* Fade only at the bottom where the logo overlaps the card */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fafaf8] to-transparent sm:h-14 dark:from-neutral-900"
            />
          </div>
        ) : null}
        <div className={cn("relative px-5 pb-5 sm:px-7 sm:pb-7", profile.coverImage ? "pt-0" : "pt-5 sm:pt-7")}>
          {!profile.coverImage ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#c1ff72]/12 to-transparent dark:from-[#c1ff72]/10"
            />
          ) : null}

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex min-w-0 gap-3.5 sm:gap-4">
              {profile.companyLogo ? (
                <div
                  className={cn(
                    "relative h-[3.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-2xl border-2 border-[#fafaf8] bg-[#f3f4f1] shadow-[0_4px_16px_-6px_rgba(0,0,0,0.18)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-lg sm:h-14 sm:w-14",
                    profile.coverImage && "-mt-6 sm:-mt-7",
                  )}
                >
                  <Image
                    src={profile.companyLogo}
                    alt={`${displayName} logo`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-600 text-lg font-bold text-white shadow-[0_4px_16px_-6px_rgba(0,0,0,0.18)] dark:from-[#c1ff72] dark:to-emerald-400 dark:text-neutral-950 dark:shadow-lg sm:h-14 sm:w-14 sm:text-xl",
                    profile.coverImage && "-mt-6 sm:-mt-7",
                  )}
                >
                  {initial}
                </div>
              )}
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-0 bg-neutral-800/90 px-2.5 font-medium text-neutral-50 hover:bg-neutral-800/90 dark:bg-[#c1ff72] dark:text-neutral-950">
                    {profile.roundType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-neutral-300/70 bg-neutral-100/40 font-medium text-neutral-600 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-300"
                  >
                    Stablecoins
                  </Badge>
                </div>
                <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.875rem] sm:leading-tight dark:text-neutral-50">
                  {displayName}
                </h1>
                {profile.tagline ? (
                  <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {profile.tagline}
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-neutral-500">
                    Review the company profile, then invest with USDC or USDT on-chain.
                  </p>
                )}
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {profile.headquarters ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200/45 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.headquarters}
                    </span>
                  ) : null}
                  {profile.teamSize ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200/45 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      <Users className="h-3.5 w-3.5" />
                      {profile.teamSize} team
                    </span>
                  ) : null}
                  {profile.website ? (
                    <ExternalHref
                      href={profile.website}
                      label={profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {onInvest && profile.canInvest ? (
              <Button
                className="hidden shrink-0 rounded-full bg-neutral-800 px-5 font-medium text-neutral-50 shadow-sm hover:bg-neutral-700 dark:bg-[#c1ff72] dark:font-semibold dark:text-neutral-950 dark:hover:bg-[#b4f25f] sm:inline-flex"
                onClick={onInvest}
              >
                Invest now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {profile.executiveSummary ? (
            <p className="relative mt-5 rounded-2xl border border-neutral-200/60 bg-neutral-100/35 px-4 py-4 text-[15px] leading-relaxed text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300">
              {profile.executiveSummary}
            </p>
          ) : null}

          {/* Funding progress */}
          <div className="relative mt-5 rounded-2xl border border-neutral-200/55 bg-neutral-100/45 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-950/80">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Raised so far
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(profile.committedAmount)}
                  <span className="ml-2 text-lg font-medium text-neutral-400">
                    of {formatCurrency(profile.targetAmount)}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                  {profile.percentage}%
                </p>
                <p className="text-xs text-neutral-500">funded</p>
              </div>
            </div>
            <Progress value={profile.percentage} className="mt-4 h-2 bg-neutral-200/70 dark:bg-neutral-800" />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span>{formatCurrency(remaining)} remaining</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {profile.daysRemaining > 0
                  ? `${profile.daysRemaining} days left in round`
                  : "Round closing soon"}
              </span>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatPill label="Valuation" value={profile.preMoneyValuation ? formatCurrency(profile.preMoneyValuation) : "—"} />
            <StatPill
              label="Min ticket"
              value={profile.minInvestment ? formatCurrency(profile.minInvestment) : "No min"}
            />
            <StatPill
              label="Max ticket"
              value={profile.maxInvestment ? formatCurrency(profile.maxInvestment) : "No cap"}
            />
          </div>
        </div>
      </div>

      {/* Section nav */}
      {visibleSections.length > 1 ? (
        <nav className="sticky top-[60px] z-20 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:top-[68px]">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="shrink-0 rounded-full border border-neutral-200/70 bg-[#fafaf8] px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300/80 hover:bg-neutral-100/60 hover:text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {section.label}
            </button>
          ))}
        </nav>
      ) : null}

      {hasAbout ? (
        <SectionShell id="about" icon={Building2} title="About the company" description="Mission, team, and story">
          <div className="space-y-3">
            <DetailBlock title="Company" content={profile.companyDescription} />
          </div>
        </SectionShell>
      ) : null}

      {hasTraction ? (
        <SectionShell
          id="traction"
          icon={TrendingUp}
          title="Traction & market"
          description="Growth, opportunity, and differentiation"
        >
          <div className="grid gap-5 sm:grid-cols-1">
            <DetailBlock title="Traction & milestones" content={profile.traction} />
            <DetailBlock title="Market opportunity" content={profile.marketOpportunity} />
            <DetailBlock title="Why we win" content={profile.competitiveAdvantage} />
          </div>
        </SectionShell>
      ) : null}

      {hasMaterials ? (
        <SectionShell
          id="materials"
          icon={FileText}
          title="Investor materials"
          description="Due diligence docs and demos"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.coverImage ? (
              <a
                href={profile.coverImage}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative col-span-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="relative aspect-[21/9] w-full bg-neutral-100 dark:bg-neutral-950">
                  <Image
                    src={profile.coverImage}
                    alt="Startup image"
                    fill
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                    unoptimized
                  />
                </div>
                <p className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  Startup image
                </p>
              </a>
            ) : null}
            {profile.pitchDeck ? (
              <MaterialTile icon={FileText} title="Pitch deck" subtitle="PDF presentation" href={profile.pitchDeck} />
            ) : null}
            {profile.financialModel ? (
              <MaterialTile
                icon={FileText}
                title="Financial model"
                subtitle="Projections & assumptions"
                href={profile.financialModel}
              />
            ) : null}
            {profile.demoVideoUrl ? (
              <MaterialTile
                icon={PlayCircle}
                title="Product demo"
                subtitle="Watch the product in action"
                href={profile.demoVideoUrl}
                external
              />
            ) : null}
            {profile.dataRoomUrl ? (
              <MaterialTile
                icon={Globe}
                title="Data room"
                subtitle="Full diligence materials"
                href={profile.dataRoomUrl}
                external
              />
            ) : null}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell id="terms" icon={Target} title="Round terms" description="Structure and use of funds">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Target raise</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(profile.targetAmount)}</p>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pre-money valuation</p>
            <p className="mt-1 text-xl font-bold">
              {profile.preMoneyValuation ? formatCurrency(profile.preMoneyValuation) : "Not disclosed"}
            </p>
          </div>
        </div>
        {profile.useOfFunds.length > 0 || profile.useOfFundsBreakdown ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Use of funds</p>
            {profile.useOfFunds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.useOfFunds.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="rounded-full px-3 py-1 font-medium"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            ) : null}
            {profile.useOfFundsBreakdown ? (
              <p className="text-[15px] leading-relaxed text-neutral-600 whitespace-pre-wrap dark:text-neutral-400">
                {profile.useOfFundsBreakdown}
              </p>
            ) : null}
          </div>
        ) : null}
        {onInvest && profile.canInvest ? (
          <Button
            className="mt-6 w-full rounded-full bg-neutral-950 font-semibold text-white hover:bg-neutral-800 dark:bg-[#c1ff72] dark:text-neutral-950 dark:hover:bg-[#b4f25f] sm:w-auto"
            onClick={onInvest}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Ready to invest?
          </Button>
        ) : null}
      </SectionShell>
    </div>
  )
}

function formatCurrencyDefault(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

export function FundraiseInvestorProfileWithDefaults(
  props: Omit<Props, "formatCurrency"> & { formatCurrency?: (amount: number) => string },
) {
  return (
    <FundraiseInvestorProfile
      {...props}
      formatCurrency={props.formatCurrency ?? formatCurrencyDefault}
    />
  )
}
