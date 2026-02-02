import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Target, BarChart3, Sparkles, Globe2, Building2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function GrowthPage() {
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
              Expansion Investment
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight text-balance lg:text-7xl mb-6">
              Growth Stage (Series B-D)
            </h1>

            <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              Track rapid expansion and market dominance strategies with comprehensive tools for Series B, C, and D investment analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Understanding Growth Stage</h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Growth stage companies (Series B-D) are focused on rapid expansion, market dominance, and building sustainable 
                competitive advantages. These companies have established product-market fit and are scaling aggressively.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trackify Atlas provides sophisticated analytics to monitor growth-stage companies, track their expansion 
                strategies, and evaluate their path to market leadership.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <img
                  src="/minimalist-line-drawing-of-person-writing-on-money.jpg"
                  alt="Growth Stage"
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
              Comprehensive features tailored for growth stage investment tracking and analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Revenue Growth Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track revenue growth rates, ARR, MRR, and revenue diversification across growth-stage companies.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Globe2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Expansion Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor geographic expansion, new market entry, and international growth strategies.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Share Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluate competitive positioning, market share gains, and industry leadership metrics.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Growth Round Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze Series B-D funding trends, valuations, and investor participation across Africa.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Organizational Scaling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track team growth, organizational structure, and leadership development.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Profitability Path</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor path to profitability, unit economics improvement, and operational efficiency gains.
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
            <h2 className="text-4xl font-bold tracking-tight mb-4">Growth Stage Dictionary</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Essential terms and insights you need to know for growth stage investing
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="series-bcd" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Series B, C, D Rounds
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  Subsequent funding rounds ($10M - $100M+) focused on rapid expansion, market dominance, and 
                  scaling operations across multiple markets or product lines.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Growth rounds in Africa often focus on geographic expansion, as companies scale from one 
                  country to multiple markets across the continent.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="market-share" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Market Share
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The percentage of total sales in an industry generated by a particular company. Market share 
                  growth is a key indicator of competitive strength.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  In African markets, market share can be fragmented across countries, making pan-African 
                  market share a key growth stage metric.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="expansion" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Geographic Expansion
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The process of entering new markets or regions. Growth-stage companies often expand to 
                  adjacent markets or new countries.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  African expansion requires navigating diverse regulatory environments, payment systems, and 
                  cultural differences across 54 countries.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profitability" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Path to Profitability
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The timeline and strategy for achieving profitability. Growth-stage companies often balance 
                  aggressive growth with improving unit economics.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Investors in growth rounds increasingly focus on clear paths to profitability, especially 
                  as companies scale across multiple African markets.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="moat" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Competitive Moat
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  A sustainable competitive advantage that protects a company's market position. Can include 
                  network effects, brand, technology, or regulatory advantages.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Building moats in African markets often involves deep local knowledge, regulatory relationships, 
                  and network effects that are hard for international competitors to replicate.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upsell" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Upsell & Cross-sell
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  Strategies to increase revenue from existing customers by selling higher-tier products (upsell) 
                  or additional products (cross-sell).
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Growth-stage companies focus heavily on expanding revenue from existing customers, as this is 
                  often more efficient than acquiring new customers.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="churn" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Churn Rate
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The percentage of customers who stop using a product or service over a given period. Low churn 
                  is critical for sustainable growth.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Managing churn in growth stage is crucial, as high growth rates can mask retention issues that 
                  become problematic at scale.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="secondary" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Secondary Sale
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The sale of existing shares by early investors or employees, providing liquidity before an 
                  exit event like IPO or acquisition.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Secondary sales are becoming more common in African growth rounds, allowing early investors 
                  to realize returns while companies continue growing.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to explore growth stage opportunities?</h2>
          <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Start tracking growth-stage companies and identify market leaders across Africa.
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
