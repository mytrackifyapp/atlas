import Link from "next/link"
import { ArrowRight, BarChart3, Target, Users, TrendingUp, Globe2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">Trackify Atlas</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#platform"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Platform
              </Link>
              <Link
                href="#ecosystem"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Ecosystem
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/founder">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/founder">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-foreground"
            >
              <Sparkles className="mr-1.5 h-3 w-3 inline-block text-primary" />
              Africa Startup Ecosystem Platform
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight text-balance lg:text-7xl mb-6">
              Navigate Africa's venture landscape with precision
            </h1>

            <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              The complete platform for investors to manage portfolios and founders to track fundraising across Africa's
              most dynamic startup ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base"
              >
                <Link href="/founder">
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
            </div>

            <div className="mt-16 flex items-center justify-center gap-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>1,200+ Startups Tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>$2.4B+ Funding Monitored</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center border-r border-border/40 last:border-r-0">
              <div className="text-4xl font-bold text-foreground mb-2">$2.4B+</div>
              <div className="text-sm text-muted-foreground">Total Funding</div>
            </div>
            <div className="text-center border-r border-border/40 last:border-r-0">
              <div className="text-4xl font-bold text-foreground mb-2">1,200+</div>
              <div className="text-sm text-muted-foreground">Active Startups</div>
            </div>
            <div className="text-center border-r border-border/40 last:border-r-0">
              <div className="text-4xl font-bold text-foreground mb-2">450+</div>
              <div className="text-sm text-muted-foreground">Investors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">15+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Built for investors and founders</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Comprehensive tools to navigate the venture capital landscape with confidence and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Portfolio Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track performance, monitor metrics, and visualize your entire portfolio in real-time with advanced
                analytics.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Deal Flow Pipeline</h3>
              <p className="text-muted-foreground leading-relaxed">
                Streamline your investment process with intelligent deal scoring and automated workflow management.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fundraising Tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage your fundraising journey with investor tracking, document management, and progress visualization.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Network Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with the right people at the right time through our comprehensive ecosystem mapping.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Globe2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access real-time market data, sector trends, and competitive intelligence across Africa.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
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
      <section id="platform" className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge
                variant="secondary"
                className="mb-4 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium"
              >
                For Investors
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight mb-6">Make data-driven investment decisions</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
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
                <Link href="/">
                  Explore Investor Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-6 border-b border-border/50 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-primary/80" />
                  <div className="h-3 w-3 rounded-full bg-chart-2/80" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-lg" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-muted/50 rounded" />
                    <div className="h-16 bg-muted/50 rounded" />
                    <div className="h-16 bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-6 border-b border-border/50 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-primary/80" />
                  <div className="h-3 w-3 rounded-full bg-chart-2/80" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-2/5" />
                  <div className="space-y-2">
                    <div className="h-2 bg-muted/50 rounded w-full" />
                    <div className="h-2 bg-muted/50 rounded w-4/5" />
                    <div className="h-2 bg-muted/50 rounded w-3/5" />
                  </div>
                  <div className="h-24 bg-gradient-to-br from-chart-2/20 to-primary/20 rounded-lg mt-4" />
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-muted/50 rounded" />
                    <div className="h-8 flex-1 bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge
                variant="secondary"
                className="mb-4 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium"
              >
                For Founders
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                Manage your fundraising journey with confidence
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
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

      {/* Built for Every Stakeholder Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Built for every stakeholder</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Whether you're managing funds, tracking portfolios, or growing your startup, Trackify Atlas adapts to your
              needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src="/images/screenshot-202025-12-16-20at-202.png"
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
                  src="/images/screenshot-202025-12-16-20at-202.png"
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
                  src="/images/screenshot-202025-12-16-20at-202.png"
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
                  src="/images/screenshot-202025-12-16-20at-202.png"
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
      <section id="ecosystem" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Explore by investment stage</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Navigate the complete venture lifecycle from seed to exit with stage-specific insights and tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <div className="aspect-square p-8 flex items-center justify-center">
                <img src="/minimalist-line-drawing-of-person-with-telescope-l.jpg" alt="Pre-seed Stage" className="w-full h-full object-contain" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-20">
                <h3 className="text-xl font-semibold mb-2">Pre-Seed & Seed</h3>
                <p className="text-sm text-muted-foreground mb-4">Early-stage validation and market entry strategies</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                >
                  Explore
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
              <div className="aspect-square p-8 flex items-center justify-center">
                <img src="/minimalist-line-drawing-of-sailboat-with-compass--.jpg" alt="Series A Stage" className="w-full h-full object-contain" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-20">
                <h3 className="text-xl font-semibold mb-2">Series A</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scaling operations and product-market fit optimization
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                >
                  Explore
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-950/20 dark:to-lime-900/20">
              <div className="aspect-square p-8 flex items-center justify-center">
                <img src="/minimalist-line-drawing-of-person-writing-on-money.jpg" alt="Growth Stage" className="w-full h-full object-contain" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-20">
                <h3 className="text-xl font-semibold mb-2">Growth Stage (B-D)</h3>
                <p className="text-sm text-muted-foreground mb-4">Rapid expansion and market dominance strategies</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                >
                  Explore
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20">
              <div className="aspect-square p-8 flex items-center justify-center">
                <img
                  src="/minimalist-line-drawing-of-stairs-climbing-upward-.jpg"
                  alt="Late Stage & Exit"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-20">
                <h3 className="text-xl font-semibold mb-2">Late Stage & Exit</h3>
                <p className="text-sm text-muted-foreground mb-4">IPO preparation and acquisition opportunities</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                >
                  Explore
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to navigate Africa's venture landscape?</h2>
          <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Join hundreds of investors and founders using Trackify Atlas to make smarter decisions in Africa's startup
            ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12">
              <Link href="/founder">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 border-border hover:bg-accent bg-transparent"
            >
              <Link href="mailto:hello@trackifyatlas.com">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">Trackify Atlas</span>
              </div>
              <p className="text-sm text-muted-foreground">Navigate Africa's venture landscape with precision.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Investor Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/founder" className="hover:text-foreground transition-colors">
                    Founder Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Trackify Atlas. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
