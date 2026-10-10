export type FinnaAudienceRole = "founder" | "investor"

export function parseViewerRole(value: unknown): FinnaAudienceRole | null {
  if (value === "founder" || value === "investor") return value
  return null
}

export function resolveFinnaAudienceRole(
  sessionRole?: string | null,
  viewerRole?: string | null,
): FinnaAudienceRole | null {
  if (sessionRole === "investor" || sessionRole === "founder") {
    return sessionRole
  }

  const view = parseViewerRole(viewerRole)
  if (view) return view
  if (sessionRole) return "founder"
  return null
}

export function formatFinnaIdentityPrompt(input: {
  name?: string | null
  audienceRole: FinnaAudienceRole | null
}): string {
  if (!input.audienceRole) {
    return `
Who this person is:
- They are signed out. Keep answers general about Trackify.
- Do not assume they have a founder or investor workspace.
- Do not greet them as both a founder and an investor.`
  }

  const firstName = input.name?.trim().split(/\s+/)[0]
  const nameLine = firstName ? ` Their first name is ${firstName}.` : ""

  if (input.audienceRole === "investor") {
    return `
Who this person is:
- Role: investor.${nameLine}
- Address them as an investor. Use their first name when it feels natural.
- Personalize every reply to an investor: portfolio, deal flow, diligence, cash, and reports.
- Speak to them in the second person about their portfolio and pipeline.
- Do not greet them as a founder. Do not offer fundraising, runway, or sales-pipeline help unless they ask.`
  }

  return `
Who this person is:
- Role: founder.${nameLine}
- Address them as a founder. Use their first name when it feels natural.
- Personalize every reply to a founder: company, cash, runway, fundraising, sales, and operations.
- Speak to them in the second person about their company.
- Do not greet them as an investor. Do not offer deal-flow or LP-portfolio help unless they ask.`
}
