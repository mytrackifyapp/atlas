import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Target, Users, TrendingUp, Globe2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { roleConfigs } from "@/lib/role-config"
import { LandingAIAssistant } from "@/components/landing-ai-assistant"
import { InvestmentStageCards } from "@/components/investment-stage-cards"

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
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2">
              <img src="/images/logo.PNG" alt="Trackify Atlas" className="h-12 w-auto object-contain" />
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-2 px-1 -mx-1"
              >
                Features
              </Link>
              <Link
                href="#platform"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-2 px-1 -mx-1"
              >
                Platform
              </Link>
              <Link
                href="#finna"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-2 px-1 -mx-1"
              >
                Finna AI
              </Link>
              <Link
                href="#ecosystem"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-2 px-1 -mx-1"
              >
                Ecosystem
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={dashboardUrl}>
                    {hasCompletedOnboarding ? "View Dashboard" : "Complete Onboarding"}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-foreground"
            >
              <Sparkles className="mr-1.5 h-3 w-3 inline-block text-primary" />
              Atlas by Trackify Finance
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-7xl mb-6">
              Navigate Africa's venture landscape with precision
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              The complete platform for investors to manage portfolios and founders to track fundraising across Africa&apos;s
              most dynamic startup ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base"
                >
                  <Link href={dashboardUrl}>
                    {hasCompletedOnboarding ? "View Dashboard" : "Complete Onboarding"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base"
                  >
                    <Link href="/sign-up">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-12 px-8 text-base border-border hover:bg-accent bg-transparent"
                  >
                    <Link href="#platform">View Platform</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden />
                <span>100+ Startups Tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden />
                <span>$2.4M+ Funding Monitored</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section - Commented out */}
      {/* <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center border-r border-border/40 last:border-r-0">
              <div className="text-4xl font-bold text-foreground mb-2">$1.4M+</div>
              <div className="text-sm text-muted-foreground">Total Funding</div>
            </div>
            <div className="text-center border-r border-border/40 last:border-r-0">
              <div className="text-4xl font-bold text-foreground mb-2">10+</div>
              <div className="text-sm text-muted-foreground">Active Startups</div>
            </div>
            <div className="text-center border-r border-border/40 last:border-r-0">
              <div className="text-4xl font-bold text-foreground mb-2">20+</div>
              <div className="text-sm text-muted-foreground">Investors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">6+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Marquee Section */}
      <section className="py-10 sm:py-12 border-y border-border/40 bg-muted/30 overflow-hidden" aria-label="Startups using Trackify Atlas">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-6">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Startups using Trackify Atlas
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
      <section id="features" className="scroll-mt-20 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for investors and founders</h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              Comprehensive tools to navigate the venture capital landscape with confidence and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img 
                  src="/icons/icon3.PNG" 
                  alt="Portfolio Management" 
                  className="h-full w-full object-contain p-1.5" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Portfolio Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track performance, monitor metrics, and visualize your entire portfolio in real-time with advanced
                analytics.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img 
                  src="/icons/icon4.PNG" 
                  alt="Deal Flow Pipeline" 
                  className="h-full w-full object-contain p-1.5" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Deal Flow Pipeline</h3>
              <p className="text-muted-foreground leading-relaxed">
                Streamline your investment process with intelligent deal scoring and automated workflow management.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img 
                  src="/icons/icon7.PNG" 
                  alt="Fundraising Tools" 
                  className="h-full w-full object-contain p-1.5" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fundraising Tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage your fundraising journey with investor tracking, document management, and progress visualization.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img 
                  src="/icons/icon4.PNG" 
                  alt="Network Intelligence" 
                  className="h-full w-full object-contain p-1.5" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Network Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with the right people at the right time through our comprehensive ecosystem mapping.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img 
                  src="/icons/icon2.PNG" 
                  alt="Market Insights" 
                  className="h-full w-full object-contain p-1.5" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access real-time market data, sector trends, and competitive intelligence across Africa.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img 
                  src="/icons/icon6.PNG" 
                  alt="AI-Powered Analysis" 
                  className="h-full w-full object-contain p-1.5" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Leverage machine learning for deal recommendations, risk assessment, and predictive analytics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="scroll-mt-20 py-20 sm:py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge
                variant="secondary"
                className="mb-4 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium"
              >
                For Investors
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 sm:mb-6">Make data-driven investment decisions</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                Access comprehensive portfolio analytics, deal flow management, and market intelligence in one unified
                platform.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time portfolio performance tracking",
                  "Automated deal scoring and pipeline management",
                  "Advanced analytics and reporting tools",
                  "Collaborative workspace for investment teams",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
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
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <img
                  src="/images/img1.PNG"
                  alt="Investor dashboard — portfolio analytics, deal flow, and market intelligence"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <img
                  src="/images/img2.PNG"
                  alt="Founder dashboard — fundraising tracker, investor pipeline, and metrics"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge
                variant="secondary"
                className="mb-4 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium"
              >
                For Founders
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 sm:mb-6">
                Manage your fundraising journey with confidence
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                Track investor relationships, organize documents, and monitor business metrics all in one place.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Investor pipeline and relationship management",
                  "Secure document sharing and data room",
                  "Business metrics and KPI tracking",
                  "Fundraising progress visualization",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
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
      </section>

      {/* Features for Founders & Startups */}
      <section id="features-founders" className="scroll-mt-20 py-20 sm:py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium"
            >
              For Founders & Startups
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for your fundraising journey</h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              Everything you need to track investors, manage documents, and hit your funding milestones—all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img
                  src="/icons/icon4.PNG"
                  alt="Investor Pipeline"
                  className="h-full w-full object-contain p-1.5"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Investor Pipeline</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track and manage relationships with investors from first contact through commitment. Never lose a lead.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img
                  src="/icons/icon3.PNG"
                  alt="Fundraising Tracker"
                  className="h-full w-full object-contain p-1.5"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fundraising Tracker</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize progress toward your round target, committed vs. pipeline, and runway at a glance.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img
                  src="/icons/icon6.PNG"
                  alt="Data Room"
                  className="h-full w-full object-contain p-1.5"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Data Room</h3>
              <p className="text-muted-foreground leading-relaxed">
                Share pitch decks, financials, and legal docs with investors in a controlled, auditable data room.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img
                  src="/icons/icon1.PNG"
                  alt="Pitch & Materials"
                  className="h-full w-full object-contain p-1.5"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pitch & Materials</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize pitch decks, one-pagers, and updates. Share the right version with the right investor.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img
                  src="/icons/icon2.PNG"
                  alt="Cap Table & Equity"
                  className="h-full w-full object-contain p-1.5"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cap Table & Equity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Keep your cap table and equity plan clear for investors. Model scenarios for new rounds and exits.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6 overflow-hidden">
                <img
                  src="/icons/icon5.PNG"
                  alt="Milestones & Metrics"
                  className="h-full w-full object-contain p-1.5"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Milestones & Metrics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track KPIs, milestones, and progress that investors care about. Report and update in one place.
              </p>
            </Card>
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

      {/* Finna AI / Agent for Atlas Section — distinct bento + chat-style UI */}
      <section id="finna" className="scroll-mt-20 py-20 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.06]" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[min(80%,24rem)] h-96 bg-primary/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: intro + feature list (no cards) */}
            <div>
              <Badge
                variant="secondary"
                className="mb-4 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Finna AI
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 sm:mb-6">
                Your AI agent for Atlas
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed mb-8 sm:mb-10">
                Finna is the intelligent assistant built into Trackify Atlas. Ask in plain language, get insights, and automate tasks—so you can focus on what matters.
              </p>
              <ul className="space-y-5">
                {[
                  { icon: Sparkles, title: "Ask in plain language", desc: "Query portfolio, pipeline, or docs—no dashboards, just ask." },
                  { icon: BarChart3, title: "Deal & portfolio insights", desc: "Summaries, comparisons, and recommendations when you need them." },
                  { icon: Target, title: "Document summarization", desc: "Pitch decks and data room files summarized with key terms and red flags." },
                  // { icon: TrendingUp, title: "Smart pipeline suggestions", desc: "Next steps and prioritization for deal flow and investor pipeline." },
                  { icon: Globe2, title: "Market intelligence", desc: "Sector trends, comparables, and context from Atlas and the ecosystem." },
                  { icon: Users, title: "Task automation", desc: "Updates, reminders, drafts, and follow-ups so your team stays in sync." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border/60 text-primary shadow-sm group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">{item.title}</span>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 sm:mt-10">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium">
                  <Link href="/sign-up">
                    Try Finna AI with Atlas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: chat-style visual */}
            <div className="relative lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground ml-2">Finna — Ask anything</span>
                </div>
                <div className="p-4 sm:p-6 space-y-4 min-h-[280px]">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm max-w-[85%]">
                      Show me top 3 deals by conviction score this month
                    </div>
                  </div>
                  <div className="flex justify-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground max-w-[90%]">
                      Here are your top 3 by conviction: <strong className="text-foreground">Deal A</strong> (92), <strong className="text-foreground">Deal B</strong> (88), <strong className="text-foreground">Deal C</strong> (85). I can deep-dive any of them or pull pipeline summary.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-md bg-primary/10 text-foreground border border-primary/20 px-4 py-2.5 text-sm max-w-[80%]">
                      Summarize the data room for Deal A
                    </div>
                  </div>
                  <div className="flex justify-start gap-3 opacity-80">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-border/50 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground max-w-[85%] flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Thinking…
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Stakeholder Section */}
      <section className="scroll-mt-20 py-20 sm:py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for every stakeholder</h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              Whether you're managing funds, tracking portfolios, or growing your startup, Trackify Atlas adapts to your
              needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src="/images/img1.PNG"
                  alt="Venture Capital Management"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  VENTURE CAPITAL
                </div>
                <h3 className="text-lg font-semibold mb-2">Track Capital Activity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor capital deployment, portfolio performance, and LP reporting seamlessly in one unified
                  platform.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src="/images/img2.PNG"
                  alt="Private Equity Management"
                  className="object-cover w-full h-full object-left"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  PRIVATE EQUITY
                </div>
                <h3 className="text-lg font-semibold mb-2">Manage Funds & SPVs</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Oversee funds, SPVs, and cap tables with unrivaled visibility, precision, and control across your
                  portfolio.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src="/images/img3.PNG"
                  alt="Corporate Innovation"
                  className="object-cover w-full h-full object-[60%]"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  CORPORATIONS
                </div>
                <h3 className="text-lg font-semibold mb-2">Equity Management</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plan and manage equity throughout your startup journey, from raising funds to IPO and beyond.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src="/images/img4.PNG"
                  alt="Limited Partners"
                  className="object-cover w-full h-full object-right"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  LIMITED PARTNERS
                </div>
                <h3 className="text-lg font-semibold mb-2">Fund Performance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor fund performance, allocations, and reports across all your private market holdings with
                  clarity.
                </p>
              </div>
            </Card>
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
            Join hundreds of investors and founders using Trackify Atlas to make smarter decisions in Africa&apos;s startup
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
                  <Link href="mailto:hello@trackifyatlas.com">Contact Sales</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/logo.PNG" alt="Trackify Atlas" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-sm text-muted-foreground">Navigate Africa's venture landscape with precision.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/portfolio" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Investor Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/founder" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Founder Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 inline-block py-0.5">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Trackify Atlas. All rights reserved.</p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-end">
              <Link href="/privacy" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-0.5">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-0.5">
                Terms
              </Link>
              <Link href="/security" className="hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 py-0.5">
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
