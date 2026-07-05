"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Building2,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  PlayCircle,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type FundraiseDetailsData = {
  id: string
  companyName?: string | null
  tagline?: string | null
  website?: string | null
  headquarters?: string | null
  teamSize?: string | null
  executiveSummary?: string | null
  founderName?: string | null
  founderTitle?: string | null
  founderBio?: string | null
  founderPhoto?: string | null
  demoVideoUrl?: string | null
  dataRoomUrl?: string | null
  companyLogo?: string | null
  coverImage?: string | null
  roundType: string
  targetAmount: number
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
}

type Props = {
  fundraise: FundraiseDetailsData
  formatCurrency: (amount: number) => string
  formatDate: (date: string | Date) => string
  onEdit: () => void
}

function DetailBlock({
  title,
  content,
  empty,
}: {
  title: string
  content?: string | null
  empty: string
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content?.trim() ? content : empty}
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
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}

export function FundraiseDetailsPanel({ fundraise, formatCurrency, formatDate, onEdit }: Props) {
  const displayName = fundraise.companyName?.trim() || "Your company"
  const hasCompanyProfile =
    fundraise.companyDescription ||
    fundraise.executiveSummary ||
    fundraise.founderBio ||
    fundraise.founderName ||
    fundraise.founderPhoto ||
    fundraise.tagline
  const founderName = fundraise.founderName?.trim() || "Founder"
  const founderInitial = founderName.charAt(0).toUpperCase()
  const hasStory =
    fundraise.traction || fundraise.marketOpportunity || fundraise.competitiveAdvantage
  const hasDocuments =
    fundraise.pitchDeck ||
    fundraise.financialModel ||
    fundraise.demoVideoUrl ||
    fundraise.dataRoomUrl ||
    fundraise.coverImage

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4 min-w-0">
              {fundraise.companyLogo ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-muted">
                  <Image src={fundraise.companyLogo} alt="Logo" fill className="object-cover" unoptimized />
                </div>
              ) : null}
              <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{fundraise.roundType} round</Badge>
                {fundraise.headquarters ? (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {fundraise.headquarters}
                  </Badge>
                ) : null}
                {fundraise.teamSize ? (
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {fundraise.teamSize} people
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-2xl">{displayName}</CardTitle>
              {fundraise.tagline ? (
                <CardDescription className="text-base">{fundraise.tagline}</CardDescription>
              ) : (
                <CardDescription>
                  Add your company name, tagline, and bio so investors know what you&apos;re building.
                </CardDescription>
              )}
              {fundraise.website ? (
                <ExternalHref href={fundraise.website} label={fundraise.website.replace(/^https?:\/\//, "")} />
              ) : null}
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={onEdit}>
              Edit details
            </Button>
          </div>
        </CardHeader>
        {fundraise.executiveSummary ? (
          <CardContent className="border-t pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Executive summary
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {fundraise.executiveSummary}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company profile
              </CardTitle>
              <CardDescription>What investors see about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {fundraise.founderPhoto || fundraise.founderName || fundraise.founderBio ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {fundraise.founderPhoto ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border">
                        <Image
                          src={fundraise.founderPhoto}
                          alt={founderName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {founderInitial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium">{founderName}</p>
                      <p className="text-sm text-muted-foreground">Founder · shown on your invest page</p>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
                    <Link href="/founder/settings">Edit profile</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  Add your photo and bio in{" "}
                  <Link href="/founder/settings" className="font-medium text-primary hover:underline">
                    Settings
                  </Link>{" "}
                  so investors see who&apos;s raising.
                </div>
              )}
              {hasCompanyProfile ? (
                <>
                  <DetailBlock
                    title="Company bio"
                    content={fundraise.companyDescription}
                    empty="No company bio yet."
                  />
                  {fundraise.founderBio ? (
                    <DetailBlock title="Founder story" content={fundraise.founderBio} empty="" />
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add your company bio, founder story, and executive summary to build investor trust.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Traction & market
              </CardTitle>
              <CardDescription>Metrics, opportunity, and differentiation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {hasStory ? (
                <>
                  <DetailBlock title="Traction & milestones" content={fundraise.traction} empty="—" />
                  <DetailBlock title="Market opportunity" content={fundraise.marketOpportunity} empty="—" />
                  <DetailBlock
                    title="Competitive advantage"
                    content={fundraise.competitiveAdvantage}
                    empty="—"
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Share revenue, growth, customers, and what makes your market attractive.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Investor materials
              </CardTitle>
              <CardDescription>Pitch deck, financials, and data room links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasDocuments ? (
                <ul className="space-y-2">
                  {fundraise.coverImage ? (
                    <li className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                          <Image src={fundraise.coverImage} alt="Startup" fill className="object-cover" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">Startup image</p>
                          <p className="text-xs text-muted-foreground">Photo or product visual</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={fundraise.coverImage} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </li>
                  ) : null}
                  {fundraise.pitchDeck ? (
                    <li className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">Pitch deck</p>
                          <p className="text-xs text-muted-foreground">PDF</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={fundraise.pitchDeck} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </li>
                  ) : null}
                  {fundraise.financialModel ? (
                    <li className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">Financial model</p>
                          <p className="text-xs text-muted-foreground">PDF</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={fundraise.financialModel} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </li>
                  ) : null}
                  {fundraise.demoVideoUrl ? (
                    <li className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">Product demo video</p>
                      </div>
                      <ExternalHref href={fundraise.demoVideoUrl} label="Watch" />
                    </li>
                  ) : null}
                  {fundraise.dataRoomUrl ? (
                    <li className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">Data room</p>
                      </div>
                      <ExternalHref href={fundraise.dataRoomUrl} label="Open" />
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Upload your pitch deck and add links to your demo or data room.
                </p>
              )}
              <Button variant="outline" size="sm" onClick={onEdit}>
                Manage materials
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Round terms
            </CardTitle>
            <CardDescription>Deal structure and timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Target raise</p>
                <p className="mt-1 font-semibold tabular-nums">{formatCurrency(fundraise.targetAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valuation</p>
                <p className="mt-1 font-semibold">
                  {fundraise.preMoneyValuation
                    ? `${formatCurrency(fundraise.preMoneyValuation)} pre-money`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Min ticket</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {fundraise.minInvestment ? formatCurrency(fundraise.minInvestment) : "No minimum"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Max ticket</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {fundraise.maxInvestment ? formatCurrency(fundraise.maxInvestment) : "No cap"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Timeline</p>
              <p className="mt-1">
                {formatDate(fundraise.startDate)} → {formatDate(fundraise.targetCloseDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Use of funds</p>
              {fundraise.useOfFunds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {fundraise.useOfFunds.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {fundraise.useOfFundsBreakdown ? (
                <p className="mt-3 leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {fundraise.useOfFundsBreakdown}
                </p>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
              Edit round terms
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
