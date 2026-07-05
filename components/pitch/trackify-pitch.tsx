import { DeckImage } from "@/components/deck/deck-image"
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  CreditCard,
  Globe2,
  Layers,
  LineChart,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.15em] text-primary mb-3">{children}</p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-primary mb-5 leading-tight">
      {children}
    </h2>
  )
}

/** Body copy — consistent readable size across sections */
const bodyText = "text-lg sm:text-xl leading-relaxed"

const problems = [
  "Investors and founders rely on spreadsheets, email threads, and disconnected tools to run deal flow and portfolio work.",
  "Financial reporting and fundraising data live in silos, slowing diligence, LP updates, and founder transparency.",
  "Cross-border capital and payments are fragmented, founders struggle to receive funds globally while investors lack unified rails.",
  "Small teams cannot afford full-time legal, finance, and GTM hires yet still need that execution speed to compete.",
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
      "Run fundraising rounds end-to-end not just track them",
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
      "Deploy AI CFO, Vera, Marketer, Sales Rep, and more",
      "Each agent owns a function contracts, runway, outreach, ops",
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
      "Specialist AI agents across legal, finance, sales, marketing, operations, and HR—your on-demand team.",
  },
]

const featuredAiAgents = AI_AGENTS_CATALOG.filter((a) =>
  ["ai-cfo", "ai-lawyer", "ai-sales-rep", "ai-marketer", "ai-ops-manager", "ai-hr"].includes(
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

const marketSizing = [
  {
    label: "TAM",
    headline: "$100B+",
    body: "Trackify operates across startup financial software, venture capital tools, fundraising infrastructure, and embedded finance representing a $100B+ global opportunity driven by digitization of financial operations and capital markets.",
  },
  {
    label: "SAM",
    headline: "Multi-billion · Africa",
    body: "Our initial focus is Africa's startup and investment ecosystem, including founders, angel investors, VC firms, and accelerators. This is a multi-billion dollar market across rapidly growing startup hubs like Nigeria, Kenya, South Africa, and Ghana.",
  },
  {
    label: "SOM",
    headline: "$5M–$15M+ ARR",
    body: "In the next 3–5 years, we aim to capture 3,000–10,000 startups and 300–1,000 investors/funds across key African markets (Nigeria, Kenya, Ghana, South Africa), establishing Trackify as a core operating layer for startup finance and capital flow. This translates into an initial $5M–$15M+ annual revenue opportunity, driven by SaaS subscriptions, investor tooling, and early transaction revenue, with strong network effects as more startups bring in more investors and capital activity compounds across the platform.",
  },
]

const competitorColumns = [
  "Finance",
  "Fundraising",
  "Portfolio Mgmt",
  "AI Ops",
  "Embedded Finance",
] as const

const competitorRows = [
  { name: "Traditional tools", supported: [true, false, false, false, false] },
  { name: "Fundraising platforms", supported: [false, true, false, false, false] },
  { name: "Portfolio tools", supported: [false, false, true, false, false] },
  { name: "Trackify Finance", supported: [true, true, true, true, true], highlight: true },
] as const

function FeatureMark({ supported }: { supported: boolean }) {
  return supported ? (
    <Check className="h-6 w-6 sm:h-7 sm:w-7 text-primary mx-auto" aria-label="Yes" />
  ) : (
    <X className="h-6 w-6 sm:h-7 sm:w-7 text-primary/50 mx-auto" aria-label="No" />
  )
}

const gtmStrategy = [
  {
    phase: "Acquire",
    items: [
      "Founder led product led growth via Atlas sign-up and onboarding",
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14 text-lg sm:text-xl print:max-w-none print:py-6 print:text-base">
      {/* Cover */}
      <header className="relative border-b border-white/10 pb-12 mb-12 sm:pb-16 sm:mb-14 print:pb-8 print:mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/35 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
            <p className="text-base sm:text-lg font-semibold text-primary mb-4">Confidential · Pitch overview</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl">
              Trackify Finance
            </h1>
            <p className="mt-2 text-2xl sm:text-3xl font-medium text-primary">Atlas</p>
            <p className={`mt-6 ${bodyText} text-white max-w-3xl`}>
              Trackify Finance is building the operating system for startups and investors in Africa combining
              financial management, capital access, AI-powered business operations, and cross-border payments into one
              unified platform through Trackify and Atlas.
            </p>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {traction.map((item) => (
                <div key={item.label}>
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{item.value}</p>
                  <p className="text-base sm:text-lg text-white mt-1">{item.label}</p>
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
                  className={`flex gap-3 ${bodyText} text-white pl-1 before:content-[''] before:mt-2.5 before:h-2 before:w-2 before:shrink-0 before:rounded-full before:bg-primary`}
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
            <p className={`${bodyText} text-white max-w-3xl`}>
              <strong className="text-white">Trackify finance</strong> is a
              unified OS for venture capital, portfolio management, founder fundraising (including receiving capital),
              cross-border payments, and an AI employee team across Africa. We combine fund grade accounting,
              capital markets expertise, and production engineering to replace fragmented spreadsheets with one platform.
            </p>
          </section>

          {/* Market opportunity */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Market opportunity</SectionLabel>
            <SectionHeading>A large, underserved venture & fintech market</SectionHeading>
            <div className="space-y-8 max-w-3xl">
              {marketSizing.map((item) => (
                <div key={item.label}>
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="text-sm sm:text-base font-semibold uppercase tracking-wider text-primary">
                      {item.label}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-white">{item.headline}</span>
                  </div>
                  <p className={`${bodyText} text-white`}>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Competitive advantage */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Competitive advantage</SectionLabel>
            <SectionHeading>Most platforms solve isolated problems.</SectionHeading>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[720px] border-collapse text-base sm:text-lg">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="py-4 pr-4 text-left font-semibold text-white">Competitor</th>
                    {competitorColumns.map((col) => (
                      <th key={col} className="py-4 px-2 text-center font-medium text-white">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitorRows.map((row) => (
                    <tr
                      key={row.name}
                      className={`border-b border-white/10 ${"highlight" in row && row.highlight ? "bg-primary/20" : ""}`}
                    >
                      <td
                        className={`py-4 pr-4 text-left text-base sm:text-lg ${"highlight" in row && row.highlight ? "font-semibold text-primary" : "text-white"}`}
                      >
                        {row.name}
                      </td>
                      {row.supported.map((supported, i) => (
                        <td key={competitorColumns[i]} className="py-4 px-2 text-center">
                          <FeatureMark supported={supported} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Go-to-market */}
          <section className="print:break-inside-avoid">
            <SectionLabel>Go-to-market strategy</SectionLabel>
            <SectionHeading>How we scale</SectionHeading>
            <div className="grid gap-6 sm:grid-cols-3">
              {gtmStrategy.map((block) => (
                <div key={block.phase}>
                  <span className="inline-block text-sm sm:text-base font-semibold uppercase tracking-wider text-primary mb-3">
                    {block.phase}
                  </span>
                  <ul className="space-y-3">
                    {block.items.map((item) => (
                      <li key={item} className={`${bodyText} text-white flex gap-2`}>
                        <ArrowRight className="h-5 w-5 shrink-0 mt-1 text-primary" aria-hidden />
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
                    className="border border-white/10 rounded-lg p-5 print:break-inside-avoid"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/25 text-primary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">{pillar.title}</h3>
                        <p className="text-sm sm:text-base text-primary font-medium">{pillar.subtitle}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {pillar.points.map((point) => (
                        <li key={point} className={`${bodyText} text-white flex gap-2`}>
                          <ArrowRight className="h-5 w-5 shrink-0 mt-1 text-primary" aria-hidden />
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
            <p className={`${bodyText} text-white max-w-3xl mb-6`}>
              Trackify ships a roster of specialist <strong className="text-white">AI employees</strong>—not just
              one chatbot. Founders and investors deploy agents for finance, legal, sales, marketing, fundraising, and
              operations. <strong className="text-white">Finna</strong> sits on top as the orchestrator across Atlas.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredAiAgents.map((agent) => (
                <li
                  key={agent.id}
                  className="border border-white/10 rounded-lg overflow-hidden print:break-inside-avoid"
                >
                  <div className="relative h-28 bg-primary/20">
                    {agent.imageSrc ? (
                      <Image
                        src={agent.imageSrc}
                        alt={agent.name}
                        fill
                        className="object-cover object-top"
                        sizes="200px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/40">
                        <agent.icon className="h-10 w-10" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs sm:text-sm uppercase tracking-wider text-white font-semibold">{agent.category}</p>
                    <h3 className="font-semibold text-base sm:text-lg text-white mt-1">{agent.name}</h3>
                    <p className="text-sm sm:text-base text-white mt-1 leading-relaxed line-clamp-3">{agent.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className={`mt-4 ${bodyText} text-white`}>
              Plus Strategy Analyst, HR Partner, Security Advisor, Procurement, GTM Planner, Executive Assistant, and more.
            </p>
          </section> */}

          {/* Cross-border payments */}
          {/* <section className="print:break-inside-avoid">
            <SectionLabel>Payments</SectionLabel>
            <SectionHeading>Cross-border payments built in</SectionHeading>
            <p className={`${bodyText} text-white max-w-3xl mb-6`}>
              Trackify Finance connects venture workflows to real money movement—so founders can{" "}
              <strong className="text-white">receive funds</strong>, pay globally, and operate across African and
              international rails without juggling five different apps.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paymentRails.map((rail) => (
                <li
                  key={rail.label}
                  className="border border-white/10 rounded-lg px-4 py-3"
                >
                  <p className="font-semibold text-base sm:text-lg text-white">{rail.label}</p>
                  <p className="text-sm sm:text-base text-white mt-1">{rail.detail}</p>
                </li>
              ))}
            </ul>
          </section> */}

          {/* Fundraising deep-dive */}
          {/* <section className="print:break-inside-avoid">
            <SectionLabel>Fundraising</SectionLabel>
            <SectionHeading>More than a tracker—receive capital on-platform</SectionHeading>
            <p className={`${bodyText} text-white max-w-3xl mb-4`}>
              Most tools only log who committed what. Trackify lets founders run the full round—pipeline, data room,
              milestones, documents—and <strong className="text-white">receive investment funds</strong> through the
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
                <li key={item} className={`${bodyText} text-white flex gap-2`}>
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary mt-1" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section> */}

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
                    className="border border-white/10 rounded-lg p-4 print:break-inside-avoid"
                  >
                    <Icon className="h-5 w-5 text-primary mb-2" aria-hidden />
                    <h3 className="font-semibold text-base sm:text-lg text-white">{mod.title}</h3>
                    <p className={`mt-2 text-sm sm:text-base leading-relaxed text-white`}>{mod.description}</p>
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
              <p className={`${bodyText} text-white`}>
                We believe the next generation of African unicorns will be built on transparent capital, disciplined
                finance, and software that connects every stakeholder—from first pitch to portfolio exit. Trackify is
                that infrastructure layer.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 overflow-hidden shadow-lg shadow-primary/10">
              <DeckImage
                src="/images/img1.PNG"
                alt="Trackify Atlas investor dashboard"
                priority
                className="deck-image-banner w-full h-auto object-cover"
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
                  className="border border-white/10 rounded-lg p-5 print:break-inside-avoid"
                >
                  <span className="inline-block rounded-full bg-primary text-primary-foreground text-sm sm:text-base font-semibold px-4 py-1.5 mb-4">
                    {block.phase}
                  </span>
                  <ul className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className={`${bodyText} text-white flex gap-2`}>
                        <TrendingUp className="h-5 w-5 shrink-0 text-primary mt-1" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="border-t border-white/10 pt-12">
            <SectionLabel>Leadership</SectionLabel>
            <SectionHeading>Built by operators who understand capital and code</SectionHeading>
            <div className="flex flex-col sm:flex-row gap-6 items-start print:break-inside-avoid">
              <div className="deck-image-frame h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/50 ring-2 ring-primary/25">
                <DeckImage
                  src="/cv/divine-gabriel.png"
                  alt="Divine Gabriel"
                  width={96}
                  height={96}
                  priority
                  className="deck-image-avatar h-full w-full object-cover object-[center_15%]"
                />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-primary">Divine Gabriel</h3>
                <p className="text-lg sm:text-xl text-white font-medium">Co-founder & CEO · Trackify Finance</p>
                <p className={`mt-3 ${bodyText} text-white max-w-xl`}>
                  Software engineer and venture operator with expertise across venture capital, accounting, portfolio
                  management, and capital markets. Leads product, platform engineering, and company strategy.
                </p>
                <a
                  href="mailto:hey@mytrackify.com"
                  className="inline-block mt-3 text-base sm:text-lg font-medium text-white hover:underline"
                >
                  hey@mytrackify.com
                </a>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center border-t border-white/15 pt-10">
            <SectionLabel>Get in touch</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4">
              Partner with Trackify Finance
            </h2>
            <p className={`${bodyText} text-white max-w-xl mx-auto mb-8`}>
              Investors, founders, LPs, and ecosystem partners—let&apos;s build the future of venture in Africa together.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-base sm:text-lg">
              <a
                href="mailto:hey@mytrackify.com?subject=Trackify%20Partnership"
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
              >
                hey@mytrackify.com
                <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="https://mytrackify.com"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5 transition-colors"
              >
                mytrackify.com
              </a>
            </div>
          </section>
      </div>

      <footer className="mt-14 border-t border-white/10 pt-6 text-center text-sm sm:text-base text-white print:hidden">
        Trackify Finance · Atlas · Confidential pitch · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
