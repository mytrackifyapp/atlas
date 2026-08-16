export type SolutionSlug = "investors" | "founders" | "startups" | "accelerators"

export type SolutionContent = {
  slug: SolutionSlug
  label: string
  title: string
  headline: string
  description: string
  features: string[]
  highlights: { title: string; description: string }[]
  ctaHref: string
  ctaLabel: string
  image?: string
  imageAlt?: string
}

export const SOLUTIONS: SolutionContent[] = [
  {
    slug: "investors",
    label: "For Investors",
    title: "For Investors | Trackify Finance",
    headline: "Make data-driven investment decisions",
    description:
      "Access comprehensive portfolio analytics, deal flow management, and market intelligence in one unified platform built for venture teams.",
    features: [
      "Real-time portfolio performance tracking",
      "Automated deal scoring and pipeline management",
      "Advanced analytics and reporting tools",
      "Collaborative workspace for investment teams",
    ],
    highlights: [
      {
        title: "Portfolio intelligence",
        description: "Track performance, exposure, and momentum across every company in your portfolio.",
      },
      {
        title: "Deal flow pipeline",
        description: "Score opportunities, manage stages, and move faster from first meeting to term sheet.",
      },
      {
        title: "Team collaboration",
        description: "Share notes, memos, and diligence in one workspace built for investment committees.",
      },
    ],
    ctaHref: "/portfolio",
    ctaLabel: "Explore Investor Dashboard",
    image: "/images/img1.PNG",
    imageAlt: "Investor dashboard — portfolio analytics, deal flow, and market intelligence",
  },
  {
    slug: "founders",
    label: "For Founders",
    title: "For Founders | Trackify Finance",
    headline: "Supercharge your startup with tools to launch, raise funds, and scale",
    description:
      "Join Trackify, the all-in-one platform for founders. Raise from investors, run finance, share a data room, and keep your company investor-ready.",
    features: [
      "Investor pipeline and relationship management",
      "Secure document sharing and data room",
      "Business metrics and KPI tracking",
      "Fundraising progress visualization",
    ],
    highlights: [
      {
        title: "Investor pipeline",
        description: "Track every conversation, follow-up, and commitment without losing momentum.",
      },
      {
        title: "Secure data room",
        description: "Share pitch decks, financials, and legal docs with full control and auditability.",
      },
      {
        title: "Metrics that matter",
        description: "Report KPIs and milestones investors care about — in one investor-ready workspace.",
      },
    ],
    ctaHref: "/founder",
    ctaLabel: "Explore Founder Dashboard",
    image: "/images/img2.PNG",
    imageAlt: "Founder dashboard — fundraising tracker, investor pipeline, and metrics",
  },
  {
    slug: "startups",
    label: "For Startups",
    title: "For Startups | Trackify Finance",
    headline: "Stay investor-ready from day one",
    description:
      "Finance, fundraising, and execution tools in one platform — so your team stays organized, transparent, and ready for every investor conversation.",
    features: [
      "Investor pipeline and fundraising tracker",
      "Cap table, equity, and milestone tracking",
      "Finance management and cash flow visibility",
      "Pitch materials and secure data room",
    ],
    highlights: [
      {
        title: "Fundraising tracker",
        description: "Visualize progress toward your round target, committed capital, and runway at a glance.",
      },
      {
        title: "Finance workspace",
        description: "Budgets, transactions, and accounts in one place — built for early-stage teams.",
      },
      {
        title: "Investor-ready ops",
        description: "Keep documents, updates, and metrics structured so diligence moves faster.",
      },
    ],
    ctaHref: "/sign-up",
    ctaLabel: "Get started free",
    image: "/images/img2.PNG",
    imageAlt: "Startup workspace — fundraising, finance, and investor updates",
  },
  {
    slug: "accelerators",
    label: "Accelerators",
    title: "For Accelerators | Trackify Finance",
    headline: "Support cohorts with structure and clarity",
    description:
      "Give every founder cohort reporting, playbooks, and structured support — with visibility into progress across your entire program.",
    features: [
      "Cohort reporting and founder progress tracking",
      "Structured playbooks and program workflows",
      "Portfolio-style visibility across accelerator batches",
      "Shared tooling for mentors, operators, and founders",
    ],
    highlights: [
      {
        title: "Cohort dashboards",
        description: "See fundraising, metrics, and milestones across every company in your batch.",
      },
      {
        title: "Program playbooks",
        description: "Standardize how founders report, prepare for demo day, and engage investors.",
      },
      {
        title: "Operator tooling",
        description: "Run your accelerator with the same rigor investors expect from portfolio companies.",
      },
    ],
    ctaHref: "/sign-up",
    ctaLabel: "Talk to our team",
    image: "/images/img1.PNG",
    imageAlt: "Accelerator program dashboard — cohort reporting and founder support",
  },
]

export const SOLUTION_SLUGS = SOLUTIONS.map((solution) => solution.slug)

export function getSolutionBySlug(slug: string): SolutionContent | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug)
}
