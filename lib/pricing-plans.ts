export type BillingInterval = "monthly" | "annual"

export type PricingPlanId = "free" | "pro" | "team" | "enterprise"

export type PricingPlan = {
  id: PricingPlanId
  name: string
  description: string
  monthlyPrice: number | null
  annualPrice: number | null
  priceLabel?: string
  cta: string
  href: string
  highlighted?: boolean
  features: string[]
  notIncluded?: string[]
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For solo founders getting started with structure and visibility.",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Get started free",
    href: "/sign-up",
    features: [
      "Founder workspace (1 user)",
      "Basic fundraising tracker",
      "Document storage (500 MB)",
      "Investor pipeline (up to 25 contacts)",
      "Monthly metrics snapshot",
      "Community support",
    ],
    notIncluded: ["AI employees", "Advanced analytics", "Team seats"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything you need to run a serious raise and stay investor-ready.",
    monthlyPrice: 20,
    annualPrice: 16,
    cta: "Start Pro trial",
    href: "/sign-up?plan=pro",
    highlighted: true,
    features: [
      "Everything in Free",
      "Full fundraising workspace & data room",
      "Unlimited investor pipeline",
      "Finance dashboard & runway tracking",
      "3 AI employees (CFO, Lawyer, Marketer)",
      "Finna AI assistant",
      "Document storage (10 GB)",
      "Exportable reports",
      "Email support",
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For founding teams and small funds collaborating on deals and portfolio.",
    monthlyPrice: 50,
    annualPrice: 40,
    cta: "Start Team trial",
    href: "/sign-up?plan=team",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Investor / Atlas dashboard access",
      "Deal flow pipeline & scoring",
      "Portfolio analytics",
      "Unlimited AI employees",
      "Shared workspaces & permissions",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom rollout for accelerators, funds, and organizations at scale.",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "Custom",
    cta: "Talk to sales",
    href: "/contact",
    features: [
      "Unlimited seats & workspaces",
      "SSO & advanced security",
      "Custom onboarding & training",
      "Dedicated success manager",
      "API access & integrations",
      "SLA & invoice billing",
      "White-label options",
    ],
  },
]

export const PRICING_FAQS = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrade or downgrade anytime from your account settings. When you upgrade, you get immediate access to new features; downgrades take effect at the end of your billing period.",
  },
  {
    question: "Is there a free trial on paid plans?",
    answer:
      "Pro and Team include a 14-day free trial. No credit card required to start on Free. You can upgrade when you're ready to unlock AI employees and advanced fundraising tools.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "Annual plans are billed once per year at the discounted per-month rate shown. You save roughly 20% compared to paying monthly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit and debit cards globally through our secure checkout partner. Enterprise customers can request invoice billing.",
  },
  {
    question: "Do you offer discounts for startups or nonprofits?",
    answer:
      "Yes. Early-stage startups in our accelerator pipeline and qualified nonprofits may be eligible for reduced pricing—contact us with details.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "You'll be prompted to add a payment method to continue on your chosen plan. If you don't subscribe, your account moves to Free with access to your existing data within Free tier limits.",
  },
] as const

export const COMPARISON_FEATURES = [
  { label: "Users", free: "1", pro: "1", team: "10", enterprise: "Unlimited" },
  { label: "Fundraising workspace", free: "Basic", pro: "Full", team: "Full", enterprise: "Full" },
  { label: "Data room", free: "—", pro: "✓", team: "✓", enterprise: "✓" },
  { label: "Investor pipeline", free: "25 contacts", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  { label: "Finance dashboard", free: "—", pro: "✓", team: "✓", enterprise: "✓" },
  { label: "AI employees", free: "—", pro: "3", team: "Unlimited", enterprise: "Unlimited" },
  { label: "Finna AI", free: "—", pro: "✓", team: "✓", enterprise: "✓" },
  { label: "Deal flow & portfolio", free: "—", pro: "—", team: "✓", enterprise: "✓" },
  { label: "API access", free: "—", pro: "—", team: "—", enterprise: "✓" },
  { label: "Support", free: "Community", pro: "Email", team: "Priority", enterprise: "Dedicated" },
] as const
