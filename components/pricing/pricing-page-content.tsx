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

  const checkoutHref = (planId: string) => {
    if (planId === "pro" || planId === "team") {
      return `/checkout?plan=${planId}&interval=${billing}`
    }
    return PRICING_PLANS.find((p) => p.id === planId)?.href ?? "/checkout"
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <TrackifyVcNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 lg:pt-36 lg:pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="mb-6 border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-800"
          >
            <Sparkles className="mr-1.5 inline-block h-3 w-3 text-neutral-700" />
            Simple, transparent pricing
          </Badge>

          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Plans that scale with your raise
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-neutral-500">
            Start free, upgrade when you need AI employees, data rooms, and investor-grade tooling.
            Built for founders and teams across Africa and beyond.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            Pro and Team plans accept <span className="font-medium text-neutral-950">USDC</span> and{" "}
            <span className="font-medium text-neutral-950">USDT</span> on Base, Polygon, and Ethereum.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billing === "monthly" ? "text-neutral-950" : "text-neutral-400",
              )}
            >
              Monthly
            </span>
            <Switch
              checked={billing === "annual"}
              onCheckedChange={(checked) => setBilling(checked ? "annual" : "monthly")}
              aria-label="Toggle annual billing"
              className="data-[state=checked]:bg-neutral-950"
            />
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billing === "annual" ? "text-neutral-950" : "text-neutral-400",
              )}
            >
              Annual
            </span>
            <Badge
              variant="secondary"
              className="ml-1 border-neutral-200 bg-neutral-100 text-xs text-neutral-800"
            >
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
                  "relative flex flex-col border-neutral-200 p-6 transition-all duration-300 lg:p-8",
                  plan.highlighted
                    ? "z-10 scale-[1.02] border-neutral-950 shadow-lg shadow-black/5 ring-1 ring-neutral-950"
                    : "hover:border-neutral-400 hover:shadow-md",
                )}
              >
                {plan.highlighted ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-neutral-950 px-3 text-white shadow-sm">Most popular</Badge>
                  </div>
                ) : null}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-neutral-500">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{displayPrice(plan)}</span>
                    {plan.monthlyPrice !== null && plan.monthlyPrice > 0 ? (
                      <span className="text-sm text-neutral-500">/ month</span>
                    ) : null}
                  </div>
                  {billing === "annual" && plan.annualPrice !== null && plan.annualPrice > 0 ? (
                    <p className="mt-1 text-xs text-neutral-500">
                      Billed {formatPrice(plan.annualPrice * 12)} yearly
                    </p>
                  ) : null}
                  {billing === "monthly" && plan.monthlyPrice !== null && plan.monthlyPrice > 0 ? (
                    <p className="mt-1 text-xs text-neutral-500">Billed monthly</p>
                  ) : null}
                </div>

                <Button
                  asChild
                  className={cn(
                    "mb-8 w-full",
                    plan.highlighted && "bg-neutral-950 text-white hover:bg-neutral-800",
                  )}
                  variant={
                    plan.highlighted ? "default" : plan.id === "enterprise" ? "outline" : "secondary"
                  }
                >
                  <Link href={checkoutHref(plan.id)}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-950" />
                      <span className="text-neutral-800">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-neutral-400">
                      <X className="mt-0.5 h-4 w-4 shrink-0 opacity-50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            All paid plans include a 14-day free trial · Prices in USD · Cancel anytime ·{" "}
            <Link
              href="/refund-policy"
              className="font-medium text-neutral-950 underline-offset-4 hover:underline"
            >
              Refund policy
            </Link>
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-y border-neutral-200 bg-neutral-50/70 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Compare plans</h2>
            <p className="text-neutral-500">See what&apos;s included at each tier</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="w-[40%] p-4 pl-6 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">Free</th>
                  <th className="p-4 text-center font-semibold text-neutral-950">Pro</th>
                  <th className="p-4 text-center font-semibold">Team</th>
                  <th className="p-4 pr-6 text-center font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-b border-neutral-100 last:border-0",
                      i % 2 === 0 && "bg-neutral-50/80",
                    )}
                  >
                    <td className="p-4 pl-6 font-medium">{row.label}</td>
                    {[row.free, row.pro, row.team, row.enterprise].map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "p-4 text-center text-neutral-500",
                          j === 1 && "font-medium text-neutral-950",
                        )}
                      >
                        {cell === "—" ? (
                          <Minus className="mx-auto h-4 w-4 opacity-30" />
                        ) : cell === "✓" ? (
                          <Check className="mx-auto h-4 w-4 text-neutral-950" />
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
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Pricing FAQ</h2>
            <p className="text-neutral-500">
              Questions about billing?{" "}
              <Link
                href="/contact"
                className="font-medium text-neutral-950 underline-offset-4 hover:underline"
              >
                Contact our team
              </Link>
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {PRICING_FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-neutral-500">
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
          <Card className="relative overflow-hidden border-neutral-200 bg-neutral-50 p-10 text-center lg:p-14">
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to run your raise on one platform?
            </h2>
            <p className="mx-auto mb-8 max-w-lg leading-relaxed text-neutral-500">
              Join founders using Trackify for fundraising, finance, and AI-powered execution. Start
              free and upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 px-8 bg-neutral-950 text-white hover:bg-neutral-800"
              >
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 bg-transparent px-8">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
