import { DeckImage } from "@/components/deck/deck-image"
import {
  BarChart3,
  Briefcase,
  Building2,
  Code2,
  Globe,
  Landmark,
  LineChart,
  Mail,
  MapPin,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
      <span className="h-px flex-1 max-w-8 bg-primary/50" aria-hidden />
      {children}
    </h2>
  )
}

const highlights = [
  { label: "Venture capital", value: "Deal flow & diligence" },
  { label: "Accounting", value: "Fund & company finance" },
  { label: "Portfolio", value: "Multi-company oversight" },
  { label: "Capital markets", value: "Private & growth raises" },
]

const expertise = [
  {
    icon: TrendingUp,
    title: "Venture capital",
    description:
      "End-to-end deal lifecycle—sourcing, screening, diligence, term sheets, and investor–founder alignment for pre-seed through growth-stage companies.",
  },
  {
    icon: Scale,
    title: "Accounting & financial reporting",
    description:
      "Fund accounting, management accounts, audit-ready reporting, and operational finance for venture-backed and institutional portfolios.",
  },
  {
    icon: BarChart3,
    title: "Portfolio management",
    description:
      "Portfolio construction, KPI frameworks, capital allocation, board reporting, and performance analytics across diversified holdings.",
  },
  {
    icon: Landmark,
    title: "Capital markets",
    description:
      "Fundraising strategy, valuation context, capital-structure design, and market intelligence across private and growth financing.",
  },
  {
    icon: Code2,
    title: "Software engineering",
    description:
      "Full-stack product leadership—architecting and shipping Trackify Finance for deal flow, portfolio intelligence, and founder operations.",
  },
  {
    icon: LineChart,
    title: "Platform & product strategy",
    description:
      "Translating venture workflows into scalable product—unifying investors, founders, and finance teams on one operating system.",
  },
]

/** Update this figure to match your actual deal-flow volume */
const STARTUPS_SCREENED = "8+"

const experience = [
  {
    role: "Co-founder",
    company: "Trackify Finance",
    location: "Africa · Venture & fintech",
    period: "2023 - Present",
    summary:
      "Building the venture operating platform for Africa connecting deal flow, portfolio management, founder tooling, and financial clarity in one place.",
    highlights: [
      "Co-founded Trackify Finance to modernize how African startups are discovered, evaluated, funded, and managed at scale.",
      `Evaluated and screened over ${STARTUPS_SCREENED} early stage startups (Pre-Seed to Series A) across SaaS and marketplace sectors, conducting deep dive due diligence on team, product, and market size—including Rizzbrand, Moodify, and other venture-backed companies.`,
      "Owns product vision, venture operations, and go to market across investor dashboards, founder workspaces, and financial modules.",
      "Led engineering and delivery of deal flow, portfolio analytics, reporting, accelerator programs, and AI-assisted venture tools.",
      "Established accounting and reporting standards on platform so founders and LPs share a single source of financial truth.",
      "Partners with founders and institutional investors on capital-markets readiness, diligence, and portfolio governance.",
    ],
  },
]

const competencies = [
  "Venture deal structuring",
  "Financial modelling",
  "IFRS-aligned reporting",
  "LP & fund reporting",
  "Due diligence",
  "Cap table management",
  "Fundraising advisory",
  "Risk & compliance awareness",
]

const technical = [
  "Deal Mechanics",
  "prompt engineering",
  "Model Evaluation & Benchmarking",
  "Investment Strategy",
  "Valuation & Modeling",
  "API design",
  "Product & System design",
  "Data & analytics",
]

const focusAreas = [
  "African venture ecosystem",
  "Fintech & financial infrastructure",
  "B2B SaaS & platforms",
  "Climate & impact ventures",
  "Growth-stage scaling",
]

export function DivineGabrielCv() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:py-6">
      {/* Hero */}
      <header className="relative border-b border-white/10 pb-10 mb-10 sm:pb-12 sm:mb-12 print:pb-8 print:mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/35 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5 sm:gap-6">
            <div className="deck-image-frame h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/50 ring-2 ring-primary/25 sm:h-24 sm:w-24">
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
              <p className="text-sm font-semibold text-primary mb-1"></p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Divine Gabriel</h1>
              <p className="mt-2 text-lg text-white/90 max-w-xl">
                Co-founder · Software engineer · Venture, accounting & capital markets
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-white sm:text-right sm:shrink-0">
            <a
              href="mailto:hey@mytrackify.com"
              className="inline-flex items-center gap-2 hover:text-primary transition-colors sm:justify-end"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              divine@mytrackify.com
            </a>
            <span className="inline-flex items-center gap-2 sm:justify-end">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              Africa · Venture & fintech
            </span>
            <a
              href="https://mytrackify.com"
              className="inline-flex items-center gap-2 hover:text-primary transition-colors sm:justify-end"
            >
              <Globe className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              mytrackify.com
            </a>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-primary/10 px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.label}</p>
              <p className="mt-0.5 text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr] print:grid-cols-1">
        {/* Sidebar */}
        <aside className="border-b lg:border-b-0 lg:border-r border-white/10 px-0 py-8 lg:pr-8 lg:py-0">
          <SectionTitle>Core competencies</SectionTitle>
          <ul className="space-y-2 text-sm text-white mb-8">
            {competencies.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <SectionTitle>Technical</SectionTitle>
          <div className="flex flex-wrap gap-1.5 mb-8">
            {technical.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white"
              >
                {skill}
              </span>
            ))}
          </div>

          <SectionTitle>Sector focus</SectionTitle>
          <ul className="space-y-2 text-sm text-white">
            {focusAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <main className="pt-8 lg:pt-0 lg:pl-10 print:pl-0">
          <section className="mb-10">
            <SectionTitle>Executive summary</SectionTitle>
            <p className="text-[15px] leading-relaxed text-white">
              Divine Gabriel is the Co-Founder of{" "}
              <strong className="font-semibold text-white">Trackify Finance</strong>, where he engineers systems
              that bridge the gap between venture capital mechanics, accounting, and portfolio management.
              Operating at the intersection of finance and software engineering, he architects the digital pipelines
              used by investors and founders across Africa to navigate deal flow, compliance, and performance
              tracking. His daily work involves translating complex financial logic, cap table data, and investment
              workflows into precise, scalable programmatic rules and user-centric product designs.
            </p>
          </section>

          <section className="mb-10">
            <SectionTitle>Professional experience</SectionTitle>
            {experience.map((job) => (
              <article key={job.company} className="group">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/25 text-primary">
                      <Building2 className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{job.role}</h3>
                      <p className="font-semibold text-white">{job.company}</p>
                      <p className="text-sm text-white/80">{job.location}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/15 bg-primary/15 px-3 py-1 text-xs font-medium text-white">
                    {job.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white pl-12">{job.summary}</p>
                <ul className="mt-4 space-y-2.5 pl-12">
                  {job.highlights.map((line) => (
                    <li
                      key={line}
                      className="relative text-sm leading-relaxed text-white pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-primary"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className="mb-10">
            <SectionTitle>Areas of expertise</SectionTitle>
            <ul className="grid gap-4 sm:grid-cols-2">
              {expertise.map((item) => {
                const Icon = item.icon
                return (
                  <li
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-primary/5 p-4 transition-colors hover:border-primary/30 hover:bg-primary/10 print:break-inside-avoid"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/25 text-primary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </div>
                      <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-white/90">{item.description}</p>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <SectionTitle>What I bring to the table</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Briefcase,
                  title: "Operator founder",
                  text: "Built Trackify from product vision to live platform, gaining first-hand experience in the exact workflows that founders and investors navigate daily.",
                },
                {
                  icon: Sparkles,
                  title: "Finance + tech",
                  text: "Possess a rare combination of fund-grade financial literacy and production-level system design, enabling seamless translation between complex financial logic and software architecture.",
                },
                {
                  icon: Globe,
                  title: "Africa-first",
                  text: "Deep domain expertise focused on building venture infrastructure, navigating regulatory nuances, and accelerating capital formation across the continent.",
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-dashed border-white/15 p-4 text-center sm:text-left"
                  >
                    <Icon className="h-5 w-5 text-primary mx-auto sm:mx-0 mb-2" aria-hidden />
                    <h3 className="text-sm font-semibold text-primary">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/90">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>

      <footer className="mt-14 border-t border-white/10 pt-6 text-center text-xs text-white/70 print:hidden">
        Divine Gabriel · Trackify Finance · Confidential CV
      </footer>
    </div>
  )
}
