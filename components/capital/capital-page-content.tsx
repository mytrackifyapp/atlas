import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Blocks,
  Briefcase,
  Building2,
  ClipboardList,
  CreditCard,
  Fingerprint,
  Home,
  Landmark,
  Layers,
  LayoutDashboard,
  Rocket,
  Scale,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { MarketingFooter } from "@/components/marketing-footer"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { Button } from "@/components/ui/button"
import { signUpForFinnaPath } from "@/lib/safe-redirect"

const AUDIENCES: {
  title: string
  kicker: string
  body: string
  items: string[]
  icon: LucideIcon
}[] = [
  {
    title: "Investors",
    kicker: "Track your capital. Understand your exposure. Discover what's next.",
    body: "Discover and manage opportunities across venture capital, private equity, private credit, startups, and other private-market assets.",
    items: [
      "Private-market opportunities",
      "Portfolio management",
      "Investment intelligence",
      "Fund reporting",
      "Investment documents",
      "Performance analytics",
      "AI-powered insights",
    ],
    icon: Briefcase,
  },
  {
    title: "Fund Managers",
    kicker: "From fundraising to portfolio reporting, manage your fund from one place.",
    body: "Build, manage, and distribute investment vehicles through modern digital infrastructure.",
    items: [
      "Fund creation",
      "Investor onboarding",
      "Capital commitments",
      "Capital calls",
      "Portfolio management",
      "Investor reporting",
      "Distributions",
      "Digital ownership infrastructure",
    ],
    icon: Landmark,
  },
  {
    title: "Founders & Companies",
    kicker: "From building your company to becoming investable.",
    body: "Connect with capital and build an investment-ready financial profile.",
    items: [
      "Financial management",
      "Investor readiness",
      "Fundraising",
      "Data rooms",
      "Cap table visibility",
      "Investor discovery",
      "Portfolio-company reporting",
    ],
    icon: Rocket,
  },
]

const ASSET_CLASSES: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Venture Capital",
    body: "Invest in professionally structured venture vehicles.",
    icon: Rocket,
  },
  {
    title: "Private Equity",
    body: "Access digitally managed private-equity opportunities.",
    icon: Building2,
  },
  {
    title: "Private Credit",
    body: "Participate in structured private-credit strategies.",
    icon: Banknote,
  },
  {
    title: "Real Estate",
    body: "Digitally manage eligible real-estate investment interests.",
    icon: Home,
  },
  {
    title: "Startup Investments",
    body: "Discover and manage investments in high-growth companies.",
    icon: Sparkles,
  },
  {
    title: "Alternative Assets",
    body: "Build diversified exposure across emerging private-market opportunities.",
    icon: Layers,
  },
]

const MARKET_CATEGORIES = [
  { label: "Venture", body: "Early-stage and growth-stage venture funds." },
  { label: "Private Equity", body: "Growth and buyout opportunities." },
  { label: "Private Credit", body: "Structured financing and private-credit strategies." },
  { label: "Startups", body: "High-growth companies raising capital." },
  { label: "Real Estate", body: "Eligible real-estate investment opportunities." },
  { label: "Alternatives", body: "Emerging private-market strategies and asset classes." },
]

const LIFECYCLE = [
  { n: "01", title: "Discover", body: "Explore investment opportunities and investment vehicles." },
  {
    n: "02",
    title: "Evaluate",
    body: "Review financials, documents, portfolio companies, strategy, and key investment information.",
  },
  {
    n: "03",
    title: "Invest",
    body: "Complete the required onboarding, eligibility, and investment process.",
  },
  {
    n: "04",
    title: "Manage",
    body: "Track ownership, commitments, portfolio exposure, and performance.",
  },
  {
    n: "05",
    title: "Monitor",
    body: "Receive reports, updates, and AI-powered portfolio intelligence.",
  },
  {
    n: "06",
    title: "Distribute",
    body: "Manage distributions and investment events digitally.",
  },
  {
    n: "07",
    title: "Transfer",
    body: "Where legally permitted, digitally facilitate transfers between eligible participants.",
  },
]

const FINNA_PROMPTS = [
  "How diversified is my portfolio?",
  "What changed across my investments this quarter?",
  "Analyze this fund's investment thesis.",
  "Show me my exposure by sector.",
  "Summarize this investment report.",
  "Which portfolio companies have raised recently?",
]

const PARTNERS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Custody",
    body: "Secure asset and investor custody infrastructure.",
    icon: Shield,
  },
  {
    title: "KYC / AML",
    body: "Identity, compliance, and investor eligibility providers.",
    icon: BadgeCheck,
  },
  {
    title: "Fund Administration",
    body: "Professional fund administration and accounting partners.",
    icon: ClipboardList,
  },
  {
    title: "Payments",
    body: "Modern payment and settlement infrastructure.",
    icon: CreditCard,
  },
  {
    title: "Legal & Regulatory",
    body: "Licensed financial institutions and legal partners.",
    icon: Scale,
  },
  {
    title: "Blockchain Infrastructure",
    body: "Permissioned networks and tokenization infrastructure.",
    icon: Blocks,
  },
]

const OS_STEPS = [
  { title: "Financial Management", body: "Manage money, expenses, income, and business finances." },
  { title: "AI Employees", body: "Automate financial work and execution with intelligent agents." },
  {
    title: "Founders & Investors",
    body: "Connect companies, capital, and investment intelligence.",
  },
  {
    title: "Private Markets",
    body: "Digitize the infrastructure connecting investors, funds, and private assets.",
  },
]

const COMING = [
  { title: "Investor OS", body: "Manage your complete investment portfolio.", icon: LayoutDashboard },
  {
    title: "Fund Infrastructure",
    body: "Give fund managers modern tools to operate and distribute investment vehicles.",
    icon: Landmark,
  },
  {
    title: "Private Markets",
    body: "Discover opportunities across venture, private equity, credit, and alternative assets.",
    icon: Briefcase,
  },
  {
    title: "Digital Ownership",
    body: "Infrastructure for digitally represented investment interests.",
    icon: Fingerprint,
  },
  {
    title: "AI Investment Intelligence",
    body: "Understand your portfolio with Finna.",
    icon: Sparkles,
  },
  {
    title: "Secondary Markets",
    body: "Explore compliant transfer infrastructure for eligible private-market interests.",
    icon: Layers,
  },
]

const ECOSYSTEM = ["Founders", "Funds", "Investors", "Trackify", "Capital"]
const ECOSYSTEM_NOTES = [
  "Build companies.",
  "Deploy capital.",
  "Provide capital.",
  "Connects, manages, and powers the ecosystem.",
  "Moves toward the opportunities where it can create value.",
]

const TRADITIONAL = [
  "Paperwork",
  "Bank transfers",
  "Spreadsheets",
  "Manual reporting",
  "Limited liquidity",
]

const TRACKIFY_PATH = [
  "Digital onboarding",
  "Investment infrastructure",
  "Portfolio intelligence",
  "Digital ownership",
  "Programmable markets",
]

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{children}</p>
  )
}

export function CapitalPageContent() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto">
          <TrackifyVcNavbar />
        </div>
      </div>

      <main>
        <section className="relative isolate min-h-dvh overflow-hidden bg-black text-white">
          <img
            src="/bg-01.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white sm:h-36"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-5 pb-28 pt-32 text-center sm:px-8 sm:pb-32 sm:pt-36">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Trackify Capital
            </p>
            <h1 className="mt-5 text-balance text-[2.15rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem] lg:leading-[1.05]">
              The infrastructure for the next generation of private markets.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg">
              Discover, access, manage, and eventually trade private-market investments — all from
              one intelligent platform.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Trackify Capital connects investors, fund managers, and high-growth companies through
              a unified investment infrastructure built for the future of capital.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-black hover:bg-white/90"
              >
                <Link href="#discover">
                  Explore Opportunities
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-12 rounded-full px-8 text-base font-medium text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/sign-up">Join the Investor Network</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Private markets, reimagined.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-500 sm:text-lg">
              Venture capital, private equity, private credit, and other alternative investments
              have traditionally been difficult to access, manage, and transfer.
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
              Trackify is building a new layer for private markets — bringing investment discovery,
              portfolio intelligence, fund infrastructure, and digitally represented ownership into
              one ecosystem.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3">
            {["One platform.", "One portfolio.", "A new way to access private capital."].map(
              (line) => (
                <p
                  key={line}
                  className="bg-white px-6 py-8 text-lg font-semibold tracking-tight sm:px-8 sm:py-10 sm:text-xl"
                >
                  {line}
                </p>
              ),
            )}
          </div>
        </section>

        <section id="ecosystem" className="scroll-mt-24 bg-neutral-50 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <SectionLabel>The capital ecosystem</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Built for the entire capital ecosystem
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {AUDIENCES.map((audience) => {
                const Icon = audience.icon
                return (
                  <article
                    key={audience.title}
                    className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-7 sm:p-8"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight">{audience.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:text-[0.95rem]">
                      {audience.body}
                    </p>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-neutral-950">
                      {audience.kicker}
                    </p>
                    <ul className="mt-6 space-y-2.5 border-t border-neutral-100 pt-6">
                      {audience.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <SectionLabel>Digital ownership</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                From traditional assets to digital ownership
              </h2>
              <p className="mt-6 text-base leading-relaxed text-neutral-500 sm:text-lg">
                The future of private markets isn&apos;t about turning everything into crypto. It is
                about making ownership, access, and investment infrastructure more programmable.
              </p>
              <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Trackify is building toward a world where eligible private-market interests can be
                digitally represented, managed, and transferred through compliant infrastructure.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <div className="rounded-3xl bg-neutral-100 p-7 sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Traditional
                </p>
                <ol className="mt-6 space-y-4">
                  {TRADITIONAL.map((step, index) => (
                    <li key={step} className="flex items-center gap-4">
                      <span className="w-6 text-xs font-medium text-neutral-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base text-neutral-600 sm:text-lg">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-center py-2 lg:px-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-primary">
                  <ArrowDown className="h-4 w-4 lg:-rotate-90" />
                </span>
              </div>

              <div className="rounded-3xl bg-neutral-950 p-7 text-white sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Trackify
                </p>
                <ol className="mt-6 space-y-4">
                  {TRACKIFY_PATH.map((step, index) => (
                    <li key={step} className="flex items-center gap-4">
                      <span className="w-6 text-xs font-medium text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base sm:text-lg">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <SectionLabel>Tokenized private markets</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Turning investment infrastructure into software.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Trackify&apos;s long-term infrastructure is designed to support digitally represented
                investment interests across private-market strategies.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ASSET_CLASSES.map((asset) => {
                const Icon = asset.icon
                return (
                  <article key={asset.title} className="rounded-3xl bg-white p-7">
                    <Icon className="h-5 w-5 text-neutral-950" strokeWidth={1.75} />
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{asset.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">{asset.body}</p>
                  </article>
                )
              })}
            </div>
            <blockquote className="mt-10 max-w-3xl border-l-2 border-primary pl-5 text-base leading-relaxed text-neutral-700 sm:text-lg">
              Tokenization is not the investment itself. It is the infrastructure that can digitally
              represent and manage an underlying legal interest.
            </blockquote>
          </div>
        </section>

        <section id="finna" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionLabel>Finna for Investors</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Your portfolio, intelligently managed.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Finna is your AI investment intelligence layer. It helps investors understand their
                private-market exposure, monitor portfolio activity, and make sense of complex
                investment information.
              </p>
              <p className="mt-6 text-lg font-semibold tracking-tight">
                Your investments shouldn&apos;t just be stored. They should be understood.
              </p>
              <Button asChild className="mt-8 h-12 rounded-full px-8 text-base font-semibold">
                <Link href="/sign-up">
                  Meet Finna
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-[1.75rem] bg-neutral-950 p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Ask</p>
              <ul className="mt-5 space-y-2.5">
                {FINNA_PROMPTS.map((prompt) => (
                  <li key={prompt}>
                    <Link
                      href={signUpForFinnaPath(prompt)}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-snug text-white/90 transition-colors hover:bg-white/10 sm:text-[0.95rem]"
                    >
                      <span>&ldquo;{prompt}&rdquo;</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="discover" className="scroll-mt-24 bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Marketplace
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Discover what&apos;s next
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
                A marketplace for private capital. Trackify brings investment opportunities into one
                intelligent discovery layer.
              </p>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {MARKET_CATEGORIES.map((category) => (
                <article key={category.label} className="bg-neutral-950 p-7 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {category.label}
                  </p>
                  <p className="mt-4 text-lg font-medium leading-snug tracking-tight text-white/90">
                    {category.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <SectionLabel>Investment lifecycle</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                One investment. Everything around it.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Trackify is designed to bring the entire investment lifecycle into one place.
              </p>
            </div>
            <ol className="mt-12 divide-y divide-neutral-200 border-y border-neutral-200">
              {LIFECYCLE.map((step) => (
                <li
                  key={step.n}
                  className="grid gap-2 py-6 sm:grid-cols-[4.5rem_14rem_1fr] sm:items-baseline sm:gap-8 sm:py-7"
                >
                  <span className="text-sm font-semibold text-primary">{step.n}</span>
                  <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-500 sm:text-base">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-neutral-50 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <SectionLabel>Connected capital</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for a more connected capital ecosystem
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Today, investors, founders, and fund managers often operate across disconnected
                systems. Trackify brings them together.
              </p>
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ECOSYSTEM.map((name, index) => (
                <li key={name} className="rounded-3xl bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {ECOSYSTEM_NOTES[index]}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <SectionLabel>Infrastructure</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                The infrastructure behind the investment
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Trackify is designed to work alongside the institutions that make financial markets
                possible. Our infrastructure can connect with specialized partners while Trackify
                focuses on the experience, intelligence, and orchestration layer.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNERS.map((partner) => {
                const Icon = partner.icon
                return (
                  <article
                    key={partner.title}
                    className="rounded-3xl border border-neutral-200 p-7"
                  >
                    <Icon className="h-5 w-5 text-neutral-950" strokeWidth={1.75} />
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{partner.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">{partner.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
          <img
            src="/bg-03.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
          <div className="relative z-10 mx-auto max-w-4xl">
            <SectionLabel>Africa-first</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Built Africa-first. Designed for global capital.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              Africa has a growing generation of founders, investors, and businesses — but much of
              the infrastructure connecting them to capital remains fragmented. Trackify is building
              from Africa outward.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                "African founders.",
                "African capital.",
                "Global investors.",
                "Modern infrastructure.",
              ].map((line) => (
                <p key={line} className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              Our ambition is to make sophisticated private-market infrastructure more accessible
              across emerging markets.
            </p>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionLabel>Operating system</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                A new operating system for private capital
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-500 sm:text-lg">
                Trackify started by helping people manage their money. It is evolving into something
                much larger.
              </p>
            </div>
            <ol className="space-y-0">
              {OS_STEPS.map((step, index) => (
                <li key={step.title} className="relative border-l border-neutral-200 py-5 pl-8">
                  <span className="absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Trackify Capital
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              The operating system for the next generation of private markets.
            </h2>
          </div>
          <div className="mx-auto mt-14 max-w-6xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Coming to Trackify
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COMING.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-3xl bg-white p-7">
                    <Icon className="h-5 w-5 text-neutral-950" strokeWidth={1.75} />
                    <h4 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-black px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-28">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.92_0.19_128/0.22),transparent_62%)]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              The future of capital is programmable.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              We&apos;re building the infrastructure that connects capital, companies, and investors
              in a single intelligent ecosystem.
            </p>
            <p className="mt-8 text-lg font-semibold tracking-tight">
              Get early access to Trackify Capital.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-black hover:bg-white/90"
              >
                <Link href="/sign-up">Join the Investor Network</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-12 rounded-full px-8 text-base font-medium text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">Partner With Trackify</Link>
              </Button>
            </div>
          </div>
        </section>

        <p className="mx-auto max-w-3xl px-5 py-8 text-center text-xs leading-relaxed text-neutral-400 sm:px-8">
          Investment availability, eligibility, tokenization, and transferability will vary by
          jurisdiction, asset, and applicable regulatory requirements. Trackify does not currently
          offer every investment product described on this page.
        </p>
      </main>

      <MarketingFooter />
    </div>
  )
}
