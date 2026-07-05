import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Brain, Briefcase, Flag, FolderLock, Globe2, Network, PieChart, Presentation, Rocket, Sparkles, Target, TrendingUp, Users, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { roleConfigs } from "@/lib/role-config"
import { LandingHero } from "@/components/landing-hero"
import { LandingProductsShowcase } from "@/components/landing-products-showcase"
import { LandingAIAssistant } from "@/components/landing-ai-assistant"
import { InvestmentStageCards } from "@/components/investment-stage-cards"
import { TrackifyVcTestimonialsMarquee } from "@/components/trackifyvc/testimonials-marquee"
import { TrackifyVcStats } from "@/components/trackifyvc/stats"
import { TrackifyVcFaq } from "@/components/trackifyvc/faq"
import TrackifyVcOriginalCta from "@/components/trackifyvc/original-cta"

export const dynamic = "force-dynamic"

export default async function Page() {
  const session = await getSessionWithRole()
  const isAuthenticated = !!session
  const hasCompletedOnboarding = session?.user.onboardingCompleted ?? false
  const userRole = session?.user.role as "investor" | "founder" | null
  
  // Determine dashboard URL based on role
  // Only use roleConfigs if role is investor or founder
  const dashboardUrl = userRole && hasCompletedOnboarding && (userRole === "investor" || userRole === "founder")
    ? roleConfigs[userRole].defaultRoute 
    : "/onboarding"

  const aiAgentsUrl =
    isAuthenticated && hasCompletedOnboarding
      ? userRole === "founder"
        ? "/founder/ai"
        : "/dashboard/ai"
      : "/sign-up"
  return (
    <div className="min-h-screen bg-background">
      <LandingHero
        isAuthenticated={isAuthenticated}
        hasCompletedOnboarding={hasCompletedOnboarding}
        dashboardUrl={dashboardUrl}
      />

      <LandingProductsShowcase />

      {/* Marquee Section — hidden */}
      <section
        className="hidden"
        aria-label="Startups using Trackify"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-6">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Startups using Trackify
          </p>
        </div>
        <div className="relative">
          <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="flex-shrink-0 px-4">
                <img
                  src={`/marquee/m${num}.PNG`}
                  alt={`Startup ${num}`}
                  className="h-24 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={`duplicate-${num}`} className="flex-shrink-0 px-4">
                <img
                  src={`/marquee/m${num}.PNG`}
                  alt={`Startup ${num}`}
                  className="h-24 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative scroll-mt-20 overflow-hidden bg-black py-20 sm:py-24 lg:py-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.08),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Built for investors and founders
            </h2>
            <p className="text-base sm:text-lg text-white/60 text-pretty">
              Comprehensive tools to navigate the venture capital landscape with confidence and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                title: "Portfolio Management",
                description:
                  "Track performance, monitor metrics, and visualize your entire portfolio in real-time with advanced analytics.",
                icon: Briefcase,
              },
              {
                title: "Deal Flow Pipeline",
                description:
                  "Streamline your investment process with intelligent deal scoring and automated workflow management.",
                icon: Workflow,
              },
              {
                title: "Fundraising Tools",
                description:
                  "Manage your fundraising journey with investor tracking, document management, and progress visualization.",
                icon: Rocket,
              },
              {
                title: "Network Intelligence",
                description:
                  "Connect with the right people at the right time through our comprehensive ecosystem mapping.",
                icon: Network,
              },
              {
                title: "Market Insights",
                description:
                  "Access real-time market data, sector trends, and competitive intelligence across Africa.",
                icon: Globe2,
              },
              {
                title: "AI-Powered Analysis",
                description:
                  "Leverage machine learning for deal recommendations, risk assessment, and predictive analytics.",
                icon: Brain,
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
              <Card
                key={feature.title}
                className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.11] hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] sm:min-h-[176px] sm:p-8 before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent"
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:border-primary/35 group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {feature.title}
                    </h3>
                    <div className="h-0.5 w-8 rounded-full bg-primary/80 transition-all duration-300 group-hover:w-12" />
                  </div>
                </div>
                <p className="relative z-10 mt-4 text-sm leading-relaxed text-white/60 sm:text-[0.9375rem]">
                  {feature.description}
                </p>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Platform Section — For Investors */}
      <section id="platform" className="scroll-mt-20 bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black px-6 py-14 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(255,255,255,0.08),transparent)]"
              aria-hidden
            />
            <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-4 border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                >
                  For Investors
                </Badge>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:mb-6 sm:text-4xl">
                  Make data-driven investment decisions
                </h2>
                <p className="mb-6 text-base leading-relaxed text-white/60 sm:mb-8 sm:text-lg">
                  Access comprehensive portfolio analytics, deal flow management, and market intelligence in one unified
                  platform.
                </p>
                <ul className="mb-8 space-y-4">
                  {[
                    "Real-time portfolio performance tracking",
                    "Automated deal scoring and pipeline management",
                    "Advanced analytics and reporting tools",
                    "Collaborative workspace for investment teams",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-white/65">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/portfolio">
                    Explore Investor Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <img
                    src="/images/img1.PNG"
                    alt="Investor dashboard — portfolio analytics, deal flow, and market intelligence"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black px-6 py-14 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_0%,rgba(255,255,255,0.08),transparent)]"
              aria-hidden
            />
            <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="order-2 lg:order-1 relative">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <img
                    src="/images/img2.PNG"
                    alt="Founder dashboard — fundraising tracker, investor pipeline, and metrics"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge
                  variant="secondary"
                  className="mb-4 border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                >
                  For Founders
                </Badge>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:mb-6 sm:text-4xl">
                  Manage your fundraising journey with confidence
                </h2>
                <p className="mb-6 text-base leading-relaxed text-white/60 sm:mb-8 sm:text-lg">
                  Track investor relationships, organize documents, and monitor business metrics all in one place.
                </p>
                <ul className="mb-8 space-y-4">
                  {[
                    "Investor pipeline and relationship management",
                    "Secure document sharing and data room",
                    "Business metrics and KPI tracking",
                    "Fundraising progress visualization",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-white/65">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/founder">
                    Explore Founder Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Founders & Startups */}
      <section id="features-founders" className="relative scroll-mt-20 overflow-hidden bg-black py-20 sm:py-24 lg:py-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.08),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
            >
              For Founders & Startups
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Built for your fundraising journey
            </h2>
            <p className="text-base sm:text-lg text-white/60 text-pretty">
              Everything you need to track investors, manage documents, and hit your funding milestones—all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                title: "Investor Pipeline",
                description:
                  "Track and manage relationships with investors from first contact through commitment. Never lose a lead.",
                icon: Users,
              },
              {
                title: "Fundraising Tracker",
                description:
                  "Visualize progress toward your round target, committed vs. pipeline, and runway at a glance.",
                icon: TrendingUp,
              },
              {
                title: "Secure Data Room",
                description:
                  "Share pitch decks, financials, and legal docs with investors in a controlled, auditable data room.",
                icon: FolderLock,
              },
              {
                title: "Pitch & Materials",
                description:
                  "Organize pitch decks, one-pagers, and updates. Share the right version with the right investor.",
                icon: Presentation,
              },
              {
                title: "Cap Table & Equity",
                description:
                  "Keep your cap table and equity plan clear for investors. Model scenarios for new rounds and exits.",
                icon: PieChart,
              },
              {
                title: "Milestones & Metrics",
                description:
                  "Track KPIs, milestones, and progress that investors care about. Report and update in one place.",
                icon: Flag,
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
              <Card
                key={feature.title}
                className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.11] hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] sm:min-h-[176px] sm:p-8 before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent"
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:border-primary/35 group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {feature.title}
                    </h3>
                    <div className="h-0.5 w-8 rounded-full bg-primary/80 transition-all duration-300 group-hover:w-12" />
                  </div>
                </div>
                <p className="relative z-10 mt-4 text-sm leading-relaxed text-white/60 sm:text-[0.9375rem]">
                  {feature.description}
                </p>
              </Card>
            )})}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/founder">
                Explore Founder Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Built for Every Stakeholder Section */}
      <section className="scroll-mt-20 bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black px-6 py-14 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-20%,rgba(255,255,255,0.08),transparent)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
                Built for every stakeholder
              </h2>
              <p className="text-base sm:text-lg text-white/60 text-pretty">
                Whether you&apos;re managing funds, tracking portfolios, or growing your startup, Trackify adapts to your
                needs.
              </p>
            </div>

            <div className="relative grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                tag: "VENTURE CAPITAL",
                title: "Track Capital Activity",
                description:
                  "Monitor capital deployment, portfolio performance, and LP reporting seamlessly in one unified platform.",
                img: { src: "/images/img1.PNG", alt: "Venture Capital Management", className: "object-cover" },
              },
              {
                tag: "PRIVATE EQUITY",
                title: "Manage Funds & SPVs",
                description:
                  "Oversee funds, SPVs, and cap tables with unrivaled visibility, precision, and control across your portfolio.",
                img: { src: "/images/img2.PNG", alt: "Private Equity Management", className: "object-cover object-left" },
              },
              {
                tag: "CORPORATIONS",
                title: "Equity Management",
                description:
                  "Plan and manage equity throughout your startup journey, from raising funds to IPO and beyond.",
                img: { src: "/images/img3.PNG", alt: "Corporate Innovation", className: "object-cover object-[60%]" },
              },
              {
                tag: "LIMITED PARTNERS",
                title: "Fund Performance",
                description:
                  "Monitor fund performance, allocations, and reports across all your private market holdings with clarity.",
                img: { src: "/images/img4.PNG", alt: "Limited Partners", className: "object-cover object-right" },
              },
            ].map((card) => (
              <Card
                key={card.tag}
                className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.11] hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={card.img.src}
                    alt={card.img.alt}
                    className={`h-full w-full ${card.img.className}`}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                    aria-hidden
                  />
                </div>

                <div className="relative p-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {card.tag}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{card.description}</p>
                </div>
              </Card>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Discover sections (Finna AI + AI Employees) */}
      <section className="scroll-mt-20 bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Discover more ways to use Trackify
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:gap-8">
            <Link href="/finna" className="group block">
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted/40 sm:rounded-3xl">
                <img
                  src="/sales.png"
                  alt="Finna AI preview"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-4 text-left text-base font-semibold leading-snug text-foreground sm:text-lg">
                Finna AI: Your venture copilot
              </p>
            </Link>

            <Link href="/ai-agents" className="group block">
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted/40 sm:rounded-3xl">
                <img
                  src="/cfo.png"
                  alt="AI employees preview"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-4 text-left text-base font-semibold leading-snug text-foreground sm:text-lg">
                AI Employees: Meet Vera — Legal Counsel
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore by Investment Stage Section */}
      <section id="ecosystem" className="scroll-mt-20 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Explore by investment stage</h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              Navigate the complete venture lifecycle from seed to exit with stage-specific insights and tools.
            </p>
          </div>

          <InvestmentStageCards />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-muted/30 border-y border-border/40" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 sm:mb-6">
            Ready to navigate Africa&apos;s venture landscape?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 text-pretty max-w-2xl mx-auto">
            Join hundreds of investors and founders using Trackify to make smarter decisions in Africa&apos;s startup
            ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-lg font-medium w-full sm:w-auto">
                <Link href={dashboardUrl}>
                  {hasCompletedOnboarding ? "View Dashboard" : "Complete Onboarding"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-lg font-medium w-full sm:w-auto">
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 rounded-lg border-border hover:bg-accent bg-transparent w-full sm:w-auto"
                >
                  <Link href="mailto:hello@trackifyfinance.com">Contact Sales</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats + FAQ (from trackifyvc components) */}
      <section
        id="faq"
        className="scroll-mt-20 border-t border-border/40 bg-black text-white"
      >
        <TrackifyVcFaq />
        <TrackifyVcStats />
      </section>

      {/* Social proof (from trackifyvc components) */}
      <section className="py-14 sm:py-18 lg:py-24 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Loved by operators
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Founders and investors use Trackify to run diligence, fundraising,
              and reporting in one place.
            </p>
          </div>
        </div>
        <TrackifyVcTestimonialsMarquee />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black">
        <TrackifyVcOriginalCta
          ctaHref={isAuthenticated ? dashboardUrl : "/sign-up"}
          ctaLabel={
            isAuthenticated
              ? hasCompletedOnboarding
                ? "View Dashboard"
                : "Complete Onboarding"
              : "Get Started"
          }
        />
        <div className="mx-auto max-w-7xl border-t border-white/10 px-6 py-12 lg:px-8">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 inline-block">
                <span className="text-xl font-bold tracking-tight text-white">Trackify Finance</span>
              </Link>
              <p className="text-sm text-white/55">Navigate Africa&apos;s venture landscape with precision.</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-white/55">
                <li>
                  <Link href="/portfolio" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Investor Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/founder" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Founder Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-white/55">
                <li>
                  <Link href="/developer" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Developer API
                  </Link>
                </li>
                <li>
                  <Link href="/whitepaper" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    White Paper
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm text-white/55">
                <li>
                  <Link href="/about" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="inline-block rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row">
            <p>© 2026 Trackify Finance. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6 md:justify-end">
              <Link href="/privacy" className="rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Privacy
              </Link>
              <Link href="/terms" className="rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Terms
              </Link>
              <Link href="/refund-policy" className="rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Refunds
              </Link>
              <Link href="/security" className="rounded py-0.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Finna AI Floating Modal */}
      <LandingAIAssistant />
    </div>
  )
}
