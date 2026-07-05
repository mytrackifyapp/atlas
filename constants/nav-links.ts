import {
  Briefcase,
  Building2,
  CreditCard,
  DatabaseZap,
  Mail,
  NewspaperIcon,
  Package,
  Rocket,
  ScrollText,
  Sparkles,
  TrendingUp,
  Users,
  Brain,
  Banknote,
  FolderOpen,
  Wallet,
} from "lucide-react"

export const NAV_LINKS = [
  {
    title: "Virtual Cards",
    href: "/integrations",
    icon: CreditCard,
  },
  {
    title: "Products",
    href: "/",
    icon: Package,
    menu: [
      {
        title: "Finna AI",
        tagline: "Your venture copilot for fundraising, diligence, and portfolio questions.",
        href: "/finna",
        icon: Sparkles,
      },
      {
        title: "AI Employees",
        tagline: "CFO, legal, and marketing agents that work alongside your team.",
        href: "/ai-agents",
        icon: Brain,
      },
      {
        title: "Investor Dashboard",
        tagline: "Portfolio analytics, deal flow, and market intelligence in one place.",
        href: "/portfolio",
        icon: Briefcase,
      },
      {
        title: "Founder Dashboard",
        tagline: "Fundraising, documents, metrics, and investor updates end-to-end.",
        href: "/founder",
        icon: Rocket,
      },
      {
        title: "Finance Management",
        tagline: "Budgets, transactions, accounts, and cash flow in one workspace.",
        href: "/founder/finance",
        icon: Wallet,
      },
      {
        title: "Deal Flow Pipeline",
        tagline: "Score deals, track stages, and move your pipeline faster.",
        href: "/deal-flow",
        icon: TrendingUp,
      },
      {
        title: "Data Room",
        tagline: "Secure document sharing and investor-ready materials.",
        href: "/founder/documents",
        icon: FolderOpen,
      },
      {
        title: "Accelerator Toolkit",
        tagline: "Cohort reporting, playbooks, and structured founder support.",
        href: "/accelerator",
        icon: Users,
      },
    ],
  },
  {
    title: "Solutions",
    href: "/",
    icon: Briefcase,
    menu: [
      {
        title: "For Investors",
        tagline: "Portfolio, deal flow, and insights in one dashboard.",
        href: "/solutions/investors",
        icon: Briefcase,
      },
      {
        title: "For Founders",
        tagline: "Run fundraising, docs, and updates end-to-end.",
        href: "/solutions/founders",
        icon: Rocket,
      },
      {
        title: "For Startups",
        tagline: "Stay investor-ready with finance and execution tools.",
        href: "/solutions/startups",
        icon: Users,
      },
      {
        title: "Accelerators",
        tagline: "Support cohorts with structure, reporting, and playbooks.",
        href: "/solutions/accelerators",
        icon: Rocket,
      },
    ],
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "AI Agents",
    href: "/ai-agents",
    icon: Brain,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: Banknote,
  },
  {
    title: "Resources",
    href: "/resources",
    icon: NewspaperIcon,
    menu: [
      {
        title: "Blog",
        tagline: "Read articles on the latest trends in tech.",
        href: "/blog",
        icon: NewspaperIcon,
      },
      {
        title: "White Paper",
        tagline: "Get answers to your questions.",
        href: "/whitepaper",
        icon: ScrollText,
      },
      {
        title: "Developer Api",
        tagline: "Get answers to your questions.",
        href: "/developer",
        icon: DatabaseZap,
      },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
] as const

