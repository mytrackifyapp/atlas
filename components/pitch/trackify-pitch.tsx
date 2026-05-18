import Image from "next/image"
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CreditCard,
  Globe2,
  Layers,
  LineChart,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800 mb-2">{children}</p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">{children}</h2>
}

const problems = [
  "Investors and founders rely on spreadsheets, email threads, and disconnected tools to run deal flow and portfolio work.",
  "Financial reporting and fundraising data live in silos—slowing diligence, LP updates, and founder transparency.",
  "Cross-border capital and payments are fragmented—founders struggle to receive funds globally while investors lack unified rails.",
  "Small teams cannot afford full-time legal, finance, and GTM hires—yet still need that execution speed to compete.",
  "Africa's venture ecosystem is growing fast, but lacks a unified operating system built for how capital actually moves on the continent.",
]

const platformPillars = [
  {
    icon: Briefcase,
    title: "For investors",
    subtitle: "Atlas investor dashboard",
    points: [
      "Real-time portfolio performance and analytics",
      "Deal flow pipeline with scoring and workflow",
      "Reports, sector views, and market intelligence",
      "Collaborative workspace for investment teams",
    ],
  },
  {
    icon: Rocket,
    title: "For founders",
    subtitle: "Founder workspace",
    points: [
      "Run fundraising rounds end-to-end—not just track them",
      "Receive investment capital through Trackify payment rails",
      "Investor pipeline, data room, and milestone tracking",
      "Metrics, updates, structure, and finance in one workspace",
    ],
  },
  {
    icon: CreditCard,
    title: "Cross-border payments",
    subtitle: "Global money movement",
    points: [
      "Seamless crypto-to-fiat and multi-currency flows",
      "Virtual cards (Visa / Mastercard) for global spend",
      "Mobile money and local rails (e.g. MTN MoMo)",
      "Apple Pay, Google Pay, and Plaid-connected funding",
    ],
  },
  {
    icon: Users,
    title: "AI team",
    subtitle: "Specialist AI employees",
    points: [
      "Deploy AI CFO, Lawyer, Marketer, Sales Rep, and more",
      "Each agent owns a function—contracts, runway, outreach, ops",
      "Finna orchestrates across portfolio, pipeline, and documents",
      "Scale execution without scaling headcount overnight",
    ],
  },
  {
    icon: Sparkles,
    title: "Finna AI",
    subtitle: "Intelligent assistant",
    points: [
      "Ask in plain language across portfolio and pipeline",
      "Deal summaries, document analysis, and red flags",
      "Market intelligence and sector context",
      "Task automation for updates and follow-ups",
    ],
  },
  {
    icon: Building2,
    title: "Accelerator",
    subtitle: "Trackify Finance 2026",
    points: [
      "12-week program for finance-focused builders",
      "Cohort launching November 2026",
      "Mentorship, GTM, product, and fundraising support",
      "Pipeline into the Trackify platform ecosystem",
    ],
  },
]

const productModules = [
  {
    icon: BarChart3,
    title: "Portfolio management",
    description: "Track performance, monitor metrics, and visualize your entire portfolio with advanced analytics.",
  },
  {
    icon: Target,
    title: "Deal flow pipeline",
    description: "Streamline sourcing through close with intelligent scoring and automated workflow management.",
  },
  {
    icon: Wallet,
    title: "Fundraising & capital intake",
    description:
      "Launch rounds, manage investors and documents, and receive funds—not just track commitments—on platform payment rails.",
  },
  {
    icon: CreditCard,
    title: "Cross-border payments",
    description:
      "Move money across borders with virtual cards, crypto-to-fiat, mobile money, and bank integrations built for African operators.",
  },
  {
    icon: LineChart,
    title: "Finance & reporting",
    description: "Accounts, budgets, transactions, and reporting—fund-grade clarity for operators and LPs.",
  },
  {
    icon: Globe2,
    title: "Market insights",
    description: "Sector trends, competitive intelligence, and ecosystem mapping across African markets.",
  },
  {
    icon: Layers,
    title: "Workspace & apps",
    description: "Extensible workspace with integrations and AI agents tailored to venture workflows.",
  },
  {
    icon: Users,
    title: "AI employee roster",
    description:
      "Specialist AI agents across legal, finance, sales, marketing, HR, strategy, and security—your on-demand team.",
  },
]

const featuredAiAgents = AI_AGENTS_CATALOG.filter((a) =>
  ["ai-cfo", "ai-lawyer", "ai-sales-rep", "ai-marketer", "ai-fundraising", "ai-investor-updates", "ai-ops-manager", "ai-strategy"].includes(
    a.id,
  ),
)

const paymentRails = [
  { label: "Crypto ↔ fiat", detail: "Bridge digital and traditional balances" },
  { label: "Virtual cards", detail: "Visa & Mastercard for global merchants" },
  { label: "Mobile money", detail: "MTN MoMo and local top-up rails" },
  { label: "Wallets", detail: "Apple Pay & Google Pay ready" },
  { label: "Bank link", detail: "Plaid-connected account funding" },
]

const traction = [
  { value: "100+", label: "Startups tracked" },
  { value: "$2.4M+", label: "Funding monitored" },
  { value: "2", label: "Core personas — investors & founders" },
  { value: "1", label: "Unified venture OS" },
]

const marketOpportunity = [
  {
    stat: "$100B+",
    label: "African fintech & venture TAM",
    detail: "Rapid growth in startup formation, fund activity, and digital finance adoption across the continent.",
  },
  {
    stat: "2-sided",
    label: "Investors & founders",
    detail: "Every dollar of venture activity touches both sides—deal flow, portfolio, and fundraising in one market.",
  },
  {
    stat: "Fragmented",
    label: "Today’s stack",
    detail: "Teams stitch together CRMs, spreadsheets, data rooms, payment apps, and consultants—no native OS for Africa.",
  },
  {
    stat: "AI shift",
    label: "Cost to serve",
    detail: "AI employees collapse the cost of finance, legal, and GTM support—unlocking SMB and fund-scale simultaneously.",
  },
]

const competitiveAdvantages = [
  {
    icon: Layers,
    title: "All-in-one venture OS",
    description:
      "Only platform combining deal flow, portfolio, fundraising, treasury, cross-border payments, and AI employees—built for Africa, not retrofitted from US tools.",
  },
  {
    icon: Wallet,
    title: "Capital that moves, not just tracks",
    description:
      "Founders receive investment funds on-platform; investors get reporting tied to real financial data—not disconnected spreadsheets.",
  },
  {
    icon: Users,
    title: "AI team, not a single chatbot",
    description:
      "Specialist agents (CFO, Lawyer, Marketer, etc.) plus Finna orchestration—execution capacity rivals hiring a full back-office.",
  },
  {
    icon: CreditCard,
    title: "Payments-native",
    description:
      "Crypto-to-fiat, virtual cards, mobile money, and global rails integrated into the same system as venture workflows.",
  },
  {
    icon: Zap,
    title: "Operator-built",
    description:
      "Founded by a software engineer with venture, accounting, portfolio, and capital-markets expertise—product reflects how capital actually works.",
  },
  {
    icon: Shield,
    title: "Trust & compliance-ready",
    description:
      "Fund-grade reporting, secure auth, and structured data designed for diligence, LP updates, and institutional partners.",
  },
]

const gtmStrategy = [
  {
    phase: "Acquire",
    items: [
      "Founder-led product-led growth via Atlas sign-up and onboarding",
      "Trackify Finance 2026 accelerator (November)—cohort as pipeline and case studies",
      "Ecosystem presence: pitch competitions, partner networks, and founder communities",
    ],
  },
  {
    phase: "Expand",
    items: [
      "Land investor teams and angels with deal flow + portfolio modules",
      "Upsell AI employees, payments, and fundraising capital intake per account",
      "Nigeria & Ghana first, then pan-African expansion with local payment rails",
    ],
  },
  {
    phase: "Retain",
    items: [
      "Data network effects: more deals, portfolios, and transactions on one platform",
      "Finna and AI agents deepen daily usage beyond periodic fundraising",
      "Enterprise packages for funds, family offices, and accelerators",
    ],
  },
]

const roadmap = [
  {
    phase: "Now",
    items: [
      "Live investor & founder dashboards on Atlas",
      "Deal flow, portfolio, reports, and analytics",
      "Fundraising with on-platform capital intake",
      "Cross-border payments and virtual card rails",
      "AI employee team + Finna orchestration",
    ],
  },
  {
    phase: "2026",
    items: [
      "Trackify Finance 2026 accelerator cohort (November launch)",
      "Deeper LP reporting and fund operations",
      "Expanded cross-border payment corridors and FX",
      "Deeper AI employee workflows with live avatars",
      "Enterprise workflows for funds and family offices",
    ],
  },
]

export function TrackifyPitch() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:py-6">
      {/* Cover */}
      <header className="relative border-b border-border/40 pb-12 mb-12 sm:pb-16 sm:mb-14 print:pb-8 print:mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/6 via-transparent to-transparent pointer-events-none print:hidden" />
        <div className="relative">
            <p className="text-sm font-semibold text-emerald-800 mb-3">Confidential · Pitch overview</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl">
              Trackify Finance
            </h1>
            <p className="mt-2 text-xl sm:text-2xl font-medium text-emerald-800">Atlas</p>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Trackify Finance is building the operating system for startups and investors in Africa—combining
              financial management, capital access, AI-powered business operations, and cross-border payments into one
              unified platform through Trackify and Atlas.
            </p>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {traction.map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-bold text-emerald-800">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
      </header>

      <div className="space-y-14 sm:space-y-16 print:space-y-10">
          {/* Problem */}
          <section className="print:break-inside-avoid">
            <SectionLabel>The problem</SectionLabel>
            <SectionHeading>Capital moves fast. Tools don&apos;t keep up.</SectionHeading>
            <ul className="space-y-3">
              {problems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15px] leading-relaxed text-foreground/90 pl-1 before:content-[''] before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-emerald-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Solution */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Our solution</SectionLabel>
            <SectionHeading>One platform for the full venture lifecycle</SectionHeading>
            <p className="text-[15px] leading-relaxed text-foreground/90 max-w-3xl">
              <strong className="text-foreground">Trackify Atlas</strong> is the flagship product of Trackify Finance—a
              unified OS for venture capital, portfolio management, founder fundraising (including receiving capital),
              cross-border payments, and an AI employee team—across Africa. We combine fund-grade accounting,
              capital-markets expertise, and production engineering to replace fragmented spreadsheets with one platform.
            </p>
          </section>

          {/* Market opportunity */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Market opportunity</SectionLabel>
            <SectionHeading>A large, underserved venture & fintech market</SectionHeading>
            <p className="text-[15px] leading-relaxed text-muted-foreground max-w-3xl mb-6">
              Africa&apos;s startup and investment activity is accelerating, but infrastructure lags—creating room for a
              category-defining platform that owns the full stack from deal to dollars.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {marketOpportunity.map((item) => (
                <li key={item.label} className="border-l-2 border-emerald-800 pl-4 py-1">
                  <p className="text-xl font-bold text-emerald-800">{item.stat}</p>
                  <p className="font-semibold text-sm text-foreground mt-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Competitive advantage */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Competitive advantage</SectionLabel>
            <SectionHeading>Why Trackify wins</SectionHeading>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {competitiveAdvantages.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-emerald-800 shrink-0" aria-hidden />
                      <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Go-to-market */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Go-to-market strategy</SectionLabel>
            <SectionHeading>How we scale</SectionHeading>
            <div className="grid gap-6 sm:grid-cols-3">
              {gtmStrategy.map((block) => (
                <div key={block.phase}>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-3">
                    {block.phase}
                  </span>
                  <ul className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="text-sm text-foreground/85 flex gap-2">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-800" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* What we're building */}
          <section>
            <SectionLabel>What we&apos;re building</SectionLabel>
            <SectionHeading>Six pillars. One ecosystem.</SectionHeading>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {platformPillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <li
                    key={pillar.title}
                    className="border border-border/40 rounded-lg p-5 print:break-inside-avoid"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-800/10 text-emerald-800">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{pillar.title}</h3>
                        <p className="text-xs text-emerald-800 font-medium">{pillar.subtitle}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {pillar.points.map((point) => (
                        <li key={point} className="text-sm text-muted-foreground flex gap-2">
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-800" aria-hidden />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* AI Team */}
          {/* <section className="print:break-inside-avoid">
            <SectionLabel>AI employees</SectionLabel>
            <SectionHeading>Your on-demand AI team</SectionHeading>
            <p className="text-[15px] leading-relaxed text-muted-foreground max-w-3xl mb-6">
              Trackify ships a roster of specialist <strong className="text-foreground">AI employees</strong>—not just
              one chatbot. Founders and investors deploy agents for finance, legal, sales, marketing, fundraising, and
              operations. <strong className="text-foreground">Finna</strong> sits on top as the orchestrator across Atlas.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredAiAgents.map((agent) => (
                <li
                  key={agent.id}
                  className="border border-border/40 rounded-lg overflow-hidden print:break-inside-avoid"
                >
                  <div className="relative h-28 bg-emerald-800/5">
                    {agent.imageSrc ? (
                      <Image
                        src={agent.imageSrc}
                        alt={agent.name}
                        fill
                        className="object-cover object-top"
                        sizes="200px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-emerald-800/40">
                        <agent.icon className="h-10 w-10" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">{agent.category}</p>
                    <h3 className="font-semibold text-sm text-foreground mt-0.5">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{agent.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Plus Strategy Analyst, HR Partner, Security Advisor, Procurement, GTM Planner, Executive Assistant, and more.
            </p>
          </section> */}

          {/* Cross-border payments */}
          {/* <section className="print:break-inside-avoid">
            <SectionLabel>Payments</SectionLabel>
            <SectionHeading>Cross-border payments built in</SectionHeading>
            <p className="text-[15px] leading-relaxed text-foreground/90 max-w-3xl mb-6">
              Trackify Finance connects venture workflows to real money movement—so founders can{" "}
              <strong className="text-foreground">receive funds</strong>, pay globally, and operate across African and
              international rails without juggling five different apps.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paymentRails.map((rail) => (
                <li
                  key={rail.label}
                  className="border border-border/40 rounded-lg px-4 py-3"
                >
                  <p className="font-semibold text-sm text-emerald-800">{rail.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rail.detail}</p>
                </li>
              ))}
            </ul>
          </section> */}

          {/* Fundraising deep-dive */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Fundraising</SectionLabel>
            <SectionHeading>More than a tracker—receive capital on-platform</SectionHeading>
            <p className="text-[15px] leading-relaxed text-muted-foreground max-w-3xl mb-4">
              Most tools only log who committed what. Trackify lets founders run the full round—pipeline, data room,
              milestones, documents—and <strong className="text-foreground">receive investment funds</strong> through the
              same financial layer used for cross-border payments and treasury.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "Launch and configure rounds (target, valuation, use of funds)",
                "Track investor pipeline from intro to committed",
                "Share pitch deck, model, and data room securely",
                "Receive funds—not just record commitments",
                "Visualize progress and milestones for your team and backers",
              ].map((item) => (
                <li key={item} className="text-sm text-foreground/85 flex gap-2">
                  <ArrowRight className="h-4 w-4 shrink-0 text-emerald-800 mt-0.5" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Product modules */}
          <section>
            <SectionLabel>Platform capabilities</SectionLabel>
            <SectionHeading>Shipped and expanding</SectionHeading>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productModules.map((mod) => {
                const Icon = mod.icon
                return (
                  <li
                    key={mod.title}
                    className="border border-border/40 rounded-lg p-4 print:break-inside-avoid"
                  >
                    <Icon className="h-5 w-5 text-emerald-800 mb-2" aria-hidden />
                    <h3 className="font-semibold text-sm text-foreground">{mod.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mod.description}</p>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Vision */}
          <section className="grid lg:grid-cols-2 gap-8 items-center print:break-inside-avoid">
            <div>
              <SectionLabel>Vision</SectionLabel>
              <SectionHeading>Navigate Africa&apos;s venture landscape with precision</SectionHeading>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                We believe the next generation of African unicorns will be built on transparent capital, disciplined
                finance, and software that connects every stakeholder—from first pitch to portfolio exit. Trackify is
                that infrastructure layer.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-xl border border-border/60 overflow-hidden shadow-lg">
              <Image
                src="/images/img1.PNG"
                alt="Trackify Atlas investor dashboard"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </section>

          {/* Roadmap */}
          <section>
            <SectionLabel>Roadmap</SectionLabel>
            <SectionHeading>Where we are headed</SectionHeading>
            <div className="grid sm:grid-cols-2 gap-6">
              {roadmap.map((block) => (
                <div
                  key={block.phase}
                  className="border border-border/40 rounded-lg p-5 print:break-inside-avoid"
                >
                  <span className="inline-block rounded-full bg-emerald-800 text-white text-xs font-semibold px-3 py-1 mb-4">
                    {block.phase}
                  </span>
                  <ul className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="text-sm text-foreground/85 flex gap-2">
                        <TrendingUp className="h-4 w-4 shrink-0 text-emerald-800 mt-0.5" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="border-t border-border/40 pt-12 print:break-inside-avoid">
            <SectionLabel>Leadership</SectionLabel>
            <SectionHeading>Built by operators who understand capital and code</SectionHeading>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-800/25 ring-2 ring-emerald-800/10">
                <Image
                  src="/cv/divine-gabriel.png"
                  alt="Divine Gabriel"
                  fill
                  className="object-cover object-[center_15%]"
                  sizes="96px"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Divine Gabriel</h3>
                <p className="text-emerald-800 font-medium">Co-founder & CEO · Trackify Finance</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xl">
                  Software engineer and venture operator with expertise across venture capital, accounting, portfolio
                  management, and capital markets. Leads product, platform engineering, and company strategy.
                </p>
                <a
                  href="mailto:hey@mytrackify.com"
                  className="inline-block mt-3 text-sm font-medium text-emerald-800 hover:underline"
                >
                  hey@mytrackify.com
                </a>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center border-t border-border/60 pt-10 print:break-inside-avoid">
            <SectionLabel>Get in touch</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Partner with Trackify Finance
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Investors, founders, LPs, and ecosystem partners—let&apos;s build the future of venture in Africa together.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="mailto:hey@mytrackify.com?subject=Trackify%20Partnership"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 text-white px-5 py-2.5 font-medium hover:bg-emerald-900 transition-colors print:border print:border-neutral-800 print:text-neutral-900 print:bg-white"
              >
                hey@mytrackify.com
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="https://mytrackify.com"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-medium text-foreground hover:bg-muted transition-colors"
              >
                mytrackify.com
              </a>
            </div>
          </section>
      </div>

      <footer className="mt-14 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground print:hidden">
        Trackify Finance · Atlas · Confidential pitch · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
