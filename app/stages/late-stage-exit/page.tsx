import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Target, BarChart3, Sparkles, Globe2, Building2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LateStageExitPage() {
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/#ecosystem">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
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
              Exit & Liquidity
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight text-balance lg:text-7xl mb-6">
              Late Stage & Exit
            </h1>

            <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              Track IPO preparation, acquisition opportunities, and exit strategies with comprehensive tools for late-stage investment analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Understanding Late Stage & Exit</h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Late-stage companies are preparing for significant liquidity events through IPOs, acquisitions, or strategic 
                partnerships. These companies have achieved market leadership and are exploring exit opportunities.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trackify Atlas provides comprehensive tracking and analytics for late-stage companies, IPO readiness, 
                and exit transaction monitoring across Africa's venture ecosystem.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <img
                  src="/minimalist-line-drawing-of-stairs-climbing-upward-.jpg"
                  alt="Late Stage & Exit"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Stage-Specific Tools</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Comprehensive features tailored for late-stage and exit investment tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">IPO Readiness Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor financial metrics, governance, and regulatory compliance for IPO preparation.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">M&A Activity Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track acquisition opportunities, strategic partnerships, and M&A transaction trends.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Valuation Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze company valuations, exit multiples, and return on investment metrics.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exit Strategy Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track exit strategy development, timeline planning, and liquidity event preparation.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Investor Relations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor investor communications, board composition, and stakeholder management.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Globe2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Leadership</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluate market position, competitive dominance, and industry leadership metrics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Dictionary Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Late Stage & Exit Dictionary</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Essential terms and insights you need to know for late-stage investing and exits
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="ipo" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                IPO (Initial Public Offering)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The process of offering shares of a private company to the public for the first time. IPOs 
                  provide liquidity for investors and access to public capital markets.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  IPOs for African tech companies are still rare but growing, with companies often listing on 
                  international exchanges like NASDAQ or NYSE.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="acquisition" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Acquisition / M&A
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The purchase of one company by another. Strategic acquisitions often involve larger companies 
                  buying startups to access technology, talent, or markets.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  M&A is the most common exit path for African startups, with both international and regional 
                  acquirers showing increasing interest.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="valuation" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Exit Valuation
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The total value of a company at exit, typically calculated as share price × total shares. 
                  Determines returns for all stakeholders.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Exit valuations in Africa are often benchmarked against global comparables, but may reflect 
                  market-specific growth potential and risks.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="multiple" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Exit Multiple
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The ratio of exit valuation to revenue or EBITDA. Common multiples include revenue multiples 
                  (e.g., 10x ARR) or EBITDA multiples (e.g., 20x EBITDA).
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Exit multiples vary by sector and growth trajectory, with high-growth SaaS companies often 
                  commanding premium multiples.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="liquidity" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Liquidity Event
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  An event that allows investors and shareholders to convert their equity into cash, such as 
                  an IPO, acquisition, or secondary sale.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Liquidity events in African tech are becoming more frequent, creating a positive cycle that 
                  attracts more capital to the ecosystem.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="due-diligence" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Due Diligence
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The comprehensive review of a company's business, financials, legal, and operational aspects 
                  before an acquisition or investment.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Due diligence for African exits often includes extensive regulatory, compliance, and market 
                  risk assessments across multiple jurisdictions.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lockup" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Lockup Period
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  A period after an IPO during which insiders and early investors are restricted from selling 
                  their shares, typically 90-180 days.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Lockup periods help stabilize stock prices post-IPO by preventing immediate large-scale 
                  selling by insiders.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="strategic-exit" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Strategic vs Financial Exit
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  Strategic exits involve acquisition by companies in related industries, while financial exits 
                  involve private equity or other financial buyers focused on returns.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Strategic exits often command higher valuations as acquirers value synergies, while financial 
                  exits focus on operational improvements and future returns.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to explore late-stage & exit opportunities?</h2>
          <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Start tracking late-stage companies and monitor exit opportunities across Africa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12">
              <Link href="/sign-up">
                Get Started Free
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 border-border hover:bg-accent bg-transparent"
            >
              <Link href="/#ecosystem">Explore Other Stages</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
