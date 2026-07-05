export type FundraiseDetailsFields = {
  companyName: string
  tagline: string
  website: string
  headquarters: string
  teamSize: string
  executiveSummary: string
  demoVideoUrl: string
  dataRoomUrl: string
  companyLogo: string | null
  coverImage: string | null
  roundType: string
  targetAmount: string
  preMoneyValuation: string
  minInvestment: string
  maxInvestment: string
  startDate: string
  targetCloseDate: string
  useOfFunds: string[]
  useOfFundsBreakdown: string
  companyDescription: string
  traction: string
  marketOpportunity: string
  competitiveAdvantage: string
  pitchDeck: string | null
  financialModel: string | null
}

export const FUNDRAISE_USE_OF_FUNDS_CATEGORIES = [
  "Product Development",
  "Team Expansion",
  "Marketing & Sales",
  "Operations",
  "Technology Infrastructure",
  "Market Expansion",
  "Research & Development",
  "Working Capital",
] as const

export const FUNDRAISE_ROUND_TYPES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Bridge Round",
  "Growth Round",
] as const

export function emptyFundraiseDetailsForm(): FundraiseDetailsFields {
  return {
    companyName: "",
    tagline: "",
    website: "",
    headquarters: "",
    teamSize: "",
    executiveSummary: "",
    demoVideoUrl: "",
    dataRoomUrl: "",
    companyLogo: null,
    coverImage: null,
    roundType: "",
    targetAmount: "",
    preMoneyValuation: "",
    minInvestment: "",
    maxInvestment: "",
    startDate: "",
    targetCloseDate: "",
    useOfFunds: [],
    useOfFundsBreakdown: "",
    companyDescription: "",
    traction: "",
    marketOpportunity: "",
    competitiveAdvantage: "",
    pitchDeck: null,
    financialModel: null,
  }
}

export function fundraiseToDetailsForm(fundraise: {
  companyName?: string | null
  tagline?: string | null
  website?: string | null
  headquarters?: string | null
  teamSize?: string | null
  executiveSummary?: string | null
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
}): FundraiseDetailsFields {
  const toDateInput = (value: string | Date) => {
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
  }

  return {
    companyName: fundraise.companyName ?? "",
    tagline: fundraise.tagline ?? "",
    website: fundraise.website ?? "",
    headquarters: fundraise.headquarters ?? "",
    teamSize: fundraise.teamSize ?? "",
    executiveSummary: fundraise.executiveSummary ?? "",
    demoVideoUrl: fundraise.demoVideoUrl ?? "",
    dataRoomUrl: fundraise.dataRoomUrl ?? "",
    companyLogo: fundraise.companyLogo ?? null,
    coverImage: fundraise.coverImage ?? null,
    roundType: fundraise.roundType,
    targetAmount: String(fundraise.targetAmount ?? ""),
    preMoneyValuation: fundraise.preMoneyValuation ? String(fundraise.preMoneyValuation) : "",
    minInvestment: fundraise.minInvestment ? String(fundraise.minInvestment) : "",
    maxInvestment: fundraise.maxInvestment ? String(fundraise.maxInvestment) : "",
    startDate: toDateInput(fundraise.startDate),
    targetCloseDate: toDateInput(fundraise.targetCloseDate),
    useOfFunds: fundraise.useOfFunds ?? [],
    useOfFundsBreakdown: fundraise.useOfFundsBreakdown ?? "",
    companyDescription: fundraise.companyDescription ?? "",
    traction: fundraise.traction ?? "",
    marketOpportunity: fundraise.marketOpportunity ?? "",
    competitiveAdvantage: fundraise.competitiveAdvantage ?? "",
    pitchDeck: fundraise.pitchDeck,
    financialModel: fundraise.financialModel,
  }
}

export function detailsFormToPayload(form: FundraiseDetailsFields) {
  return {
    companyName: form.companyName.trim(),
    tagline: form.tagline.trim(),
    website: form.website.trim(),
    headquarters: form.headquarters.trim(),
    teamSize: form.teamSize.trim(),
    executiveSummary: form.executiveSummary.trim(),
    demoVideoUrl: form.demoVideoUrl.trim(),
    dataRoomUrl: form.dataRoomUrl.trim(),
    companyLogo: form.companyLogo,
    coverImage: form.coverImage,
    roundType: form.roundType,
    targetAmount: form.targetAmount,
    preMoneyValuation: form.preMoneyValuation,
    minInvestment: form.minInvestment,
    maxInvestment: form.maxInvestment,
    startDate: form.startDate,
    targetCloseDate: form.targetCloseDate,
    useOfFunds: form.useOfFunds,
    useOfFundsBreakdown: form.useOfFundsBreakdown.trim(),
    companyDescription: form.companyDescription.trim(),
    traction: form.traction.trim(),
    marketOpportunity: form.marketOpportunity.trim(),
    competitiveAdvantage: form.competitiveAdvantage.trim(),
    pitchDeck: form.pitchDeck,
    financialModel: form.financialModel,
  }
}
