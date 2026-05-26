"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Check, Minus, Sparkles, X } from "lucide-react"

import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  COMPARISON_FEATURES,
  PRICING_FAQS,
  PRICING_PLANS,
  type BillingInterval,
} from "@/lib/pricing-plans"

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PricingPageContent() {
  const [billing, setBilling] = useState<BillingInterval>("annual")

  const displayPrice = (plan: (typeof PRICING_PLANS)[number]) => {
    if (plan.priceLabel) return plan.priceLabel
    const amount = billing === "annual" ? plan.annualPrice : plan.monthlyPrice
    if (amount === null || amount === undefined) return "—"
    if (amount === 0) return "$0"
    return formatPrice(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <TrackifyVcNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 lg:pt-36 lg:pb-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="mb-6 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-foreground"
          >
            <Sparkles className="mr-1.5 h-3 w-3 inline-block text-primary" />
            Simple, transparent pricing
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl mb-5">
            Plans that scale with your raise
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Start free, upgrade when you need AI employees, data rooms, and investor-grade tooling.
            Built for founders and teams across Africa and beyond.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billing === "monthly" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            <Switch
              checked={billing === "annual"}
              onCheckedChange={(checked) => setBilling(checked ? "annual" : "monthly")}
              aria-label="Toggle annual billing"
            />
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billing === "annual" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Annual
            </span>
            <Badge variant="secondary" className="ml-1 border-primary/30 bg-primary/10 text-foreground text-xs">
              Save 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col p-6 lg:p-8 border-border/50 transition-all duration-300",
                  plan.highlighted
                    ? "border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/20 scale-[1.02] z-10"
                    : "hover:border-primary/20 hover:shadow-md",
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-sm px-3">Most popular</Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{displayPrice(plan)}</span>
                    {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground text-sm">/ month</span>
                    )}
                  </div>
                  {billing === "annual" && plan.annualPrice !== null && plan.annualPrice > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed {formatPrice(plan.annualPrice * 12)} yearly
                    </p>
                  )}
                  {billing === "monthly" && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Billed monthly</p>
                  )}
                </div>

                <Button
                  asChild
                  className={cn(
                    "w-full mb-8",
                    plan.highlighted && "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                  variant={
                    plan.highlighted ? "default" : plan.id === "enterprise" ? "outline" : "secondary"
                  }
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                      <X className="h-4 w-4 shrink-0 mt-0.5 opacity-50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All paid plans include a 14-day free trial · Prices in USD · Cancel anytime ·{" "}
            <Link href="/refund-policy" className="text-primary font-medium hover:underline">
              Refund policy
            </Link>
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Compare plans</h2>
            <p className="text-muted-foreground">See what&apos;s included at each tier</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold p-4 pl-6 w-[40%]">Feature</th>
                  <th className="p-4 text-center font-semibold">Free</th>
                  <th className="p-4 text-center font-semibold text-primary">Pro</th>
                  <th className="p-4 text-center font-semibold">Team</th>
                  <th className="p-4 pr-6 text-center font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-b border-border/30 last:border-0",
                      i % 2 === 0 && "bg-muted/30",
                    )}
                  >
                    <td className="p-4 pl-6 font-medium">{row.label}</td>
                    {[row.free, row.pro, row.team, row.enterprise].map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "p-4 text-center text-muted-foreground",
                          j === 1 && "text-foreground font-medium",
                        )}
                      >
                        {cell === "—" ? (
                          <Minus className="h-4 w-4 mx-auto opacity-30" />
                        ) : cell === "✓" ? (
                          <Check className="h-4 w-4 mx-auto text-primary" />
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Pricing FAQ</h2>
            <p className="text-muted-foreground">
              Questions about billing?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline">
                Contact our team
              </Link>
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {PRICING_FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-10 lg:p-14 text-center">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary),0.15),transparent_60%)]" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Ready to run your raise on one platform?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              Join founders using Trackify for fundraising, finance, and AI-powered execution—start
              free and upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 bg-transparent">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
