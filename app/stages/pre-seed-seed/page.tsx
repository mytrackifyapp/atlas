import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Target, BarChart3, Sparkles, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PreSeedSeedPage() {
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
              Early Stage Investment
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight text-balance lg:text-7xl mb-6">
              Pre-Seed & Seed Stage
            </h1>

            <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
              Navigate the earliest stages of startup development with tools designed for validation, market entry, and initial funding rounds.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Understanding Pre-Seed & Seed</h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                The pre-seed and seed stages represent the foundational phase of a startup's journey. At this critical juncture, 
                founders validate their ideas, build initial products, and secure their first institutional capital.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trackify Atlas provides comprehensive tools to track these early-stage companies, monitor their progress, 
                and identify investment opportunities across Africa's dynamic startup ecosystem.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <img
                  src="/minimalist-line-drawing-of-person-with-telescope-l.jpg"
                  alt="Pre-Seed & Seed"
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
              Comprehensive features tailored for pre-seed and seed stage investment tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Idea Validation Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor how startups validate their concepts, test market fit, and iterate on their initial products.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Early Metrics Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track key performance indicators from user acquisition to revenue growth in the earliest stages.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team & Founder Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluate founding teams, track their backgrounds, and assess execution capabilities.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Funding Round Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze seed round trends, valuations, and investor participation across Africa.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Entry Strategies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track how startups approach market entry, customer acquisition, and competitive positioning.
              </p>
            </Card>

            <Card className="p-8 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pipeline Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize and prioritize early-stage investment opportunities in your deal flow pipeline.
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
            <h2 className="text-4xl font-bold tracking-tight mb-4">Pre-Seed & Seed Dictionary</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Essential terms and insights you need to know for early-stage investing
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="pre-seed" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Pre-Seed Funding
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The earliest stage of institutional funding, typically ranging from $50K to $500K. Pre-seed rounds help 
                  founders validate their idea, build an MVP, and conduct initial market research.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  In Africa, pre-seed funding often comes from angel investors, accelerators, and early-stage VCs 
                  who are willing to take significant risks on unproven concepts.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seed" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Seed Round
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  Typically the first significant round of institutional funding ($500K - $2M), used to build the product, 
                  acquire initial customers, and prove product-market fit.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Seed rounds in Africa are increasingly competitive, with investors looking for strong founding teams, 
                  clear market opportunities, and early traction indicators.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mvp" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                MVP (Minimum Viable Product)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The simplest version of a product that can be released to early adopters to validate core assumptions 
                  and gather feedback.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  For African startups, MVPs often need to address unique local challenges like payment infrastructure, 
                  connectivity, and regulatory compliance from day one.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="product-market-fit" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Product-Market Fit (PMF)
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The stage where a product satisfies strong market demand. Indicators include organic growth, high 
                  customer retention, and word-of-mouth referrals.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Achieving PMF in African markets often requires deep local understanding, as solutions that work 
                  elsewhere may need significant adaptation.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="traction" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Traction
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  Evidence of customer demand and business growth. Common metrics include user growth, revenue, 
                  engagement rates, and partnerships.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Early-stage investors in Africa value traction that demonstrates understanding of local market 
                  dynamics, even if absolute numbers are small.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="valuation-cap" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Valuation Cap
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The maximum valuation at which a SAFE (Simple Agreement for Future Equity) converts into equity 
                  in a future priced round.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Pre-seed and seed rounds in Africa often use SAFEs with valuation caps, providing flexibility for 
                  both founders and investors in uncertain markets.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="runway" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Runway
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  The amount of time a startup can operate before running out of cash, typically calculated by dividing 
                  cash balance by monthly burn rate.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  African startups often need longer runways due to slower customer acquisition cycles and longer 
                  sales cycles in many markets.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="angel-investor" className="border border-border/50 rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Angel Investor
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  High-net-worth individuals who invest their own money in early-stage startups, often providing 
                  mentorship and industry connections.
                </p>
                <p className="text-sm font-medium text-foreground mt-3">Key Insight:</p>
                <p className="text-sm">
                  Angel investors in Africa are increasingly important, often bringing local market knowledge and 
                  networks that international VCs may lack.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to explore pre-seed & seed opportunities?</h2>
          <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Start tracking early-stage startups and discover the next generation of African innovation.
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
