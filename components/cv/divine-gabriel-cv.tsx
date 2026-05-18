import Image from "next/image"
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
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
      <span className="h-px flex-1 max-w-8 bg-emerald-800/50" aria-hidden />
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

const experience = [
  {
    role: "Co-founder & CEO",
    company: "Trackify Finance",
    location: "Africa · Venture & fintech",
    period: "Present",
    summary:
      "Building the venture operating platform for Africa—connecting deal flow, portfolio management, founder tooling, and financial clarity in one place.",
    highlights: [
      "Co-founded Trackify Finance to modernize how African startups are discovered, evaluated, funded, and managed at scale.",
      "Owns product vision, venture operations, and go-to-market across investor dashboards, founder workspaces, and financial modules.",
      "Led engineering and delivery of deal flow, portfolio analytics, reporting, accelerator programs, and AI-assisted venture tools.",
      "Established accounting and reporting standards on-platform so founders and LPs share a single source of financial truth.",
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
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "MongoDB",
  "Cloud (Vercel)",
  "API design",
  "Product design",
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
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl shadow-black/5 print:rounded-none print:border-0 print:shadow-none">
        {/* Hero */}
        <header className="relative border-b border-border/60 bg-gradient-to-br from-emerald-950/[0.06] via-card to-emerald-900/[0.04] px-6 py-10 sm:px-10 sm:py-12 print:bg-white print:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none print:hidden" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5 sm:gap-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-800/25 shadow-lg shadow-emerald-900/25 ring-2 ring-emerald-800/10 sm:h-24 sm:w-24">
                <Image
                  src="/cv/divine-gabriel.png"
                  alt="Divine Gabriel"
                  fill
                  className="object-cover object-[center_15%]"
                  sizes="(max-width: 640px) 80px, 96px"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800 mb-1">Trackify Finance</p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Divine Gabriel
                </h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-xl">
                  Co-founder & CEO · Software engineer · Venture, accounting & capital markets
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:text-right sm:shrink-0">
              <a
                href="mailto:hey@mytrackify.com"
                className="inline-flex items-center gap-2 hover:text-foreground transition-colors sm:justify-end"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                hey@mytrackify.com
              </a>
              <span className="inline-flex items-center gap-2 sm:justify-end">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                Africa · Venture & fintech
              </span>
              <a
                href="https://mytrackify.com"
                className="inline-flex items-center gap-2 hover:text-foreground transition-colors sm:justify-end"
              >
                <Globe className="h-4 w-4 shrink-0" aria-hidden />
                mytrackify.com
              </a>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm px-4 py-3 print:border-neutral-200 print:bg-neutral-50"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-[240px_1fr] print:grid-cols-1">
          {/* Sidebar */}
          <aside className="border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/20 px-6 py-8 sm:px-8 lg:py-10 print:bg-neutral-50 print:border-neutral-200">
            <SectionTitle>Core competencies</SectionTitle>
            <ul className="space-y-2 text-sm text-foreground/90 mb-8">
              {competencies.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-800" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <SectionTitle>Technical</SectionTitle>
            <div className="flex flex-wrap gap-1.5 mb-8">
              {technical.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-foreground/85"
                >
                  {skill}
                </span>
              ))}
            </div>

            <SectionTitle>Sector focus</SectionTitle>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </aside>

          {/* Main */}
          <main className="px-6 py-8 sm:px-10 sm:py-10">
            <section className="mb-10">
              <SectionTitle>Executive summary</SectionTitle>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                Divine Gabriel is co-founder and CEO of{" "}
                <strong className="font-semibold text-foreground">Trackify Finance</strong>, where he
                unites venture capital, accounting, portfolio management, and capital-markets
                expertise with hands-on software engineering. He designs and builds the systems
                investors and founders use to move from first meeting to funded, reported, and
                portfolio-managed—with clarity across deal flow, financials, and performance—
                across Africa&apos;s venture landscape.
              </p>
            </section>

            <section className="mb-10">
              <SectionTitle>Professional experience</SectionTitle>
              {experience.map((job) => (
                <article key={job.company} className="group">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800/10 text-emerald-800 print:bg-neutral-100 print:text-emerald-900">
                        <Building2 className="h-4 w-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{job.role}</h3>
                        <p className="font-semibold text-emerald-800">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {job.period}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground pl-12 sm:pl-12">
                    {job.summary}
                  </p>
                  <ul className="mt-4 space-y-2.5 pl-12 sm:pl-12">
                    {job.highlights.map((line) => (
                      <li
                        key={line}
                        className="relative text-sm leading-relaxed text-foreground/85 pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-emerald-800"
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
                      className="rounded-xl border border-border/50 bg-muted/10 p-4 transition-colors hover:border-emerald-800/25 hover:bg-emerald-900/[0.04] print:break-inside-avoid"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800/12 text-emerald-800">
                          <Icon className="h-4 w-4" aria-hidden />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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
                    title: "Operator-founder",
                    text: "Built Trackify from product vision to live platform—not advisory-only.",
                  },
                  {
                    icon: Sparkles,
                    title: "Finance + tech",
                    text: "Rare blend of fund-grade accounting literacy and production engineering.",
                  },
                  {
                    icon: Globe,
                    title: "Africa-first",
                    text: "Deep focus on venture infrastructure and capital formation on the continent.",
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-dashed border-border/70 p-4 text-center sm:text-left"
                    >
                      <Icon className="h-5 w-5 text-emerald-800 mx-auto sm:mx-0 mb-2" aria-hidden />
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          </main>
        </div>

        <footer className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground print:hidden">
          Divine Gabriel · Trackify Finance · Confidential CV
        </footer>
      </div>
    </div>
  )
}
