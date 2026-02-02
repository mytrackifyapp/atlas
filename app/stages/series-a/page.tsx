import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Target, BarChart3, Sparkles, Globe2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SeriesAPage() {
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
              Growth Investment
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight text-balance lg:text-7xl mb-6">
              Series A Stage
            </h1>

            <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              Scale operations and optimize product-market fit with comprehensive tools for Series A investment tracking and portfolio management.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Understanding Series A</h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Series A represents a critical inflection point where startups transition from early validation to scaling operations. 
                Companies at this stage have proven product-market fit and are ready to expand their market presence.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trackify Atlas provides advanced analytics and tracking capabilities to monitor Series A companies, 
                assess their scaling strategies, and make informed investment decisions.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <img
                  src="/minimalist-line-drawing-of-sailboat-with-compass--.jpg"
                  alt="Series A"
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
              Comprehensive features tailored for Series A investment tracking and analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Scaling Metrics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track revenue growth, customer acquisition costs, and unit economics as companies scale.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Product-Market Fit Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluate how well companies have achieved product-market fit and their expansion strategies.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Expansion Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor hiring patterns, leadership additions, and organizational growth.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Series A Round Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze Series A funding trends, valuations, and investor syndicates across Africa.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Globe2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Expansion</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track geographic expansion, market penetration strategies, and competitive positioning.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Operational Efficiency</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor operational metrics, burn rates, and path to profitability.
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
            <h2 className="text-4xl font-bold tracking-tight mb-4">Series A Dictionary</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Essential terms and insights you need to know for Series A investing
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="series-a" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Series A Round
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  Typically the first significant venture capital round ($2M - $15M), used to scale operations, 
                  expand the team, and accelerate growth after proving product-market fit.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Series A rounds in Africa are increasingly competitive, with investors looking for strong revenue 
                  growth, clear unit economics, and scalable business models.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="unit-economics" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Unit Economics
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The revenue and costs associated with a single unit of a product or service. Key metrics include 
                  Customer Lifetime Value (LTV) and Customer Acquisition Cost (CAC).
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Strong unit economics are critical for Series A in Africa, as investors need confidence that the 
                  business model can scale profitably across diverse markets.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cac" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                CAC (Customer Acquisition Cost)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The total cost of acquiring a new customer, including marketing and sales expenses. Ideally, 
                  CAC should be significantly lower than LTV.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  CAC in African markets can vary significantly by country and channel, making it crucial to 
                  understand local customer acquisition dynamics.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ltv" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                LTV (Lifetime Value)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The total revenue a company expects to earn from a customer over their entire relationship. 
                  A healthy LTV:CAC ratio is typically 3:1 or higher.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Understanding LTV in African markets requires accounting for payment behavior, subscription 
                  retention, and market-specific usage patterns.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="burn-rate" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Burn Rate
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The rate at which a company spends its cash reserves, typically measured monthly. Net burn 
                  rate accounts for revenue, while gross burn rate does not.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Series A companies in Africa need to balance aggressive growth with sustainable burn rates, 
                  as follow-on funding can be less predictable than in mature markets.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="arr" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                ARR (Annual Recurring Revenue)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The value of recurring revenue normalized to a one-year period. Critical for SaaS and 
                  subscription businesses to demonstrate predictable revenue growth.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  ARR growth is a key Series A metric, with investors typically looking for 100%+ year-over-year 
                  growth and strong retention rates.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mrr" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                MRR (Monthly Recurring Revenue)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The predictable revenue a company expects to receive every month from active subscriptions. 
                  MRR × 12 = ARR.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  MRR growth and retention are critical Series A metrics, showing both growth velocity and 
                  business sustainability.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lead-investor" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Lead Investor
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The primary investor in a funding round who sets the terms, takes a board seat, and often 
                  invests the largest amount.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Choosing the right lead investor for Series A in Africa is crucial, as they bring not just 
                  capital but strategic guidance and network access for scaling.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to explore Series A opportunities?</h2>
          <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Start tracking Series A companies and identify scaling startups across Africa.
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
