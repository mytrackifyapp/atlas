export const LINKEDIN_POST_SIZE = 1080

export const LINKEDIN_ART = {
  ink: "#171717",
  muted: "#5c6658",
  white: "#ffffff",
  profileSrc: "/cv/divine-gabriel.png",
  profileFocusY: 0.08,
  logoSrc: "/content/trackify-finance-mark.png",
} as const

export type LinkedInAudience = "personal" | "company"

export type LinkedInHeadlineLine = {
  text: string
  tone: "ink" | "muted"
}

export type LinkedInStudioPost = {
  id: string
  audience: LinkedInAudience
  category: string
  lines: LinkedInHeadlineLine[]
  label: string
  caption: string
}

export const PERSONAL_LINKEDIN_POSTS: LinkedInStudioPost[] = [
  {
    id: "operator",
    audience: "personal",
    category: "Operator",
    lines: [
      { text: "Founder. Engineer.", tone: "ink" },
      { text: "Operator.", tone: "muted" },
    ],
    label: "Divine Gabriel",
    caption: `Founder. Engineer. Operator.

I spend my days turning venture mechanics into software — deal flow, accounting, and portfolio work in one place.

Building Trackify Finance for investors and founders across Africa.

#VentureCapital #AfricanStartups #Fintech #BuildInPublic`,
  },
  {
    id: "craft",
    audience: "personal",
    category: "Craft",
    lines: [
      { text: "Venture is a craft.", tone: "ink" },
      { text: "Not a spreadsheet.", tone: "muted" },
    ],
    label: "Divine Gabriel",
    caption: `Venture is a craft. Not a spreadsheet.

The work is judgment, speed, and clean systems — so founders and investors can see the same truth.

That's the standard I'm building toward.

#Venture #Founders #Investors #Trackify`,
  },
  {
    id: "clarity",
    audience: "personal",
    category: "Clarity",
    lines: [
      { text: "Clarity over noise.", tone: "ink" },
      { text: "Then ship.", tone: "muted" },
    ],
    label: "Divine Gabriel",
    caption: `Clarity over noise. Then ship.

Most teams don't need more dashboards. They need one operating picture — and the next action.

#Leadership #Startups #Execution`,
  },
  {
    id: "africa",
    audience: "personal",
    category: "Africa",
    lines: [
      { text: "Africa doesn't need", tone: "ink" },
      { text: "another dashboard.", tone: "muted" },
    ],
    label: "Divine Gabriel",
    caption: `Africa doesn't need another dashboard.

It needs rails: capital, reporting, and founder ops that actually move with the team.

That's why Trackify Finance exists.

#Africa #VentureCapital #Fintech`,
  },
  {
    id: "systems",
    audience: "personal",
    category: "Systems",
    lines: [
      { text: "Software + capital.", tone: "ink" },
      { text: "One operating system.", tone: "muted" },
    ],
    label: "Divine Gabriel",
    caption: `Software + capital. One operating system.

I build at the intersection of venture, accounting, and product — because those workflows were never meant to live in separate tabs.

#Product #VentureOps #TrackifyFinance`,
  },
  {
    id: "deal",
    audience: "personal",
    category: "Deal flow",
    lines: [
      { text: "Screen the deal.", tone: "ink" },
      { text: "Then move.", tone: "muted" },
    ],
    label: "Divine Gabriel",
    caption: `Screen the deal. Then move.

Diligence should create conviction, not a pile of files. Fast signal. Clear next step.

#DealFlow #DueDiligence #Investing`,
  },
]

export const COMPANY_LINKEDIN_POSTS: LinkedInStudioPost[] = [
  {
    id: "connected",
    audience: "company",
    category: "Platform",
    lines: [
      { text: "Deal flow.", tone: "ink" },
      { text: "Portfolio + finance.", tone: "muted" },
      { text: "Connected.", tone: "muted" },
    ],
    label: "Trackify Finance",
    caption: `Deal flow. Portfolio + finance. Connected.

Trackify Finance is the operating system for how capital actually moves — from first intro to portfolio reporting.

#TrackifyFinance #VentureOS #AfricanVC`,
  },
  {
    id: "workspace",
    audience: "company",
    category: "Product",
    lines: [
      { text: "One workspace.", tone: "ink" },
      { text: "Investors and founders.", tone: "muted" },
    ],
    label: "Trackify Finance",
    caption: `One workspace. Investors and founders.

Stop stitching spreadsheets, email, and data rooms. Run fundraising, portfolio, and finance in one place.

#Startups #Investors #TrackifyFinance`,
  },
  {
    id: "rails",
    audience: "company",
    category: "Capital",
    lines: [
      { text: "Capital should move", tone: "ink" },
      { text: "as fast as the team.", tone: "muted" },
    ],
    label: "Trackify Finance",
    caption: `Capital should move as fast as the team.

Cross-border payments, founder finance, and investor reporting — built for how African venture actually operates.

#Fintech #Payments #VentureCapital`,
  },
  {
    id: "raise",
    audience: "company",
    category: "Fundraising",
    lines: [
      { text: "Fundraising isn't a slide.", tone: "ink" },
      { text: "It's a system.", tone: "muted" },
    ],
    label: "Trackify Finance",
    caption: `Fundraising isn't a slide. It's a system.

Pipeline, data room, milestones, and capital in — so founders can raise without losing the operating plot.

#Fundraising #Founders #TrackifyFinance`,
  },
  {
    id: "ai",
    audience: "company",
    category: "AI",
    lines: [
      { text: "AI employees.", tone: "ink" },
      { text: "Real operating work.", tone: "muted" },
    ],
    label: "Trackify Finance",
    caption: `AI employees. Real operating work.

Legal, finance, sales, and GTM specialists — so small teams can move with the speed of a full bench.

#AI #Startups #TrackifyFinance`,
  },
  {
    id: "intelligence",
    audience: "company",
    category: "Intelligence",
    lines: [
      { text: "Portfolio intelligence.", tone: "ink" },
      { text: "Without the noise.", tone: "muted" },
    ],
    label: "Trackify Finance",
    caption: `Portfolio intelligence. Without the noise.

See performance, pipeline, and risk in one picture — then act.

#Portfolio #VentureCapital #TrackifyFinance`,
  },
]

export function postsForAudience(audience: LinkedInAudience): LinkedInStudioPost[] {
  return audience === "personal" ? PERSONAL_LINKEDIN_POSTS : COMPANY_LINKEDIN_POSTS
}
