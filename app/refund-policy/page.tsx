import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  HelpCircle,
  RefreshCcw,
  RotateCcw,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Refund Policy | Trackify Atlas",
  description:
    "Refund and cancellation policy for Trackify Atlas software subscriptions, including free trials, Pro, and Team plans.",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight">Trackify Atlas</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pricing
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-32 pb-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <RotateCcw className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Refund Policy</h1>
            <p className="text-lg text-muted-foreground">Last updated: May 2026</p>
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              This policy explains how refunds work for paid subscriptions to Trackify Atlas software
              (Free, Pro, and Team plans). By subscribing, you agree to this policy in addition to our{" "}
              <Link href="/terms" className="text-primary font-medium hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="space-y-8">
            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                1. Free trial
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Pro and Team plans include a <strong className="text-foreground">14-day free trial</strong>.
                  During the trial, you are not charged unless you add a payment method and your trial
                  converts to a paid subscription.
                </p>
                <p>
                  If you cancel before the trial ends, you will not be charged. No refund is necessary
                  because no payment was taken.
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCcw className="h-6 w-6 text-primary" />
                2. Money-back guarantee
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you are not satisfied with a paid Pro or Team subscription, you may request a{" "}
                  <strong className="text-foreground">full refund within 14 days</strong> of your first
                  charge for that subscription (not including renewals).
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Applies to your first payment on Pro ($20/month or annual equivalent) or Team ($50/month or annual equivalent)</li>
                  <li>One refund per customer per plan tier</li>
                  <li>Must be your first paid subscription on that account for the plan in question</li>
                </ul>
                <p>
                  After 14 days from the first charge, subscription fees are generally non-refundable for
                  the current billing period, except where required by law.
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                3. Monthly vs annual billing
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Monthly plans:</strong> If you cancel, you keep
                  access until the end of the current billing period. Refunds for partial months are not
                  provided after the 14-day money-back window, unless required by law.
                </p>
                <p>
                  <strong className="text-foreground">Annual plans:</strong> If you qualify for a refund
                  within 14 days of your first annual charge, we refund the full annual amount. After 14
                  days, annual subscriptions are non-refundable for the remainder of the term; you may
                  cancel to prevent renewal at the end of the period.
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4">4. How to request a refund</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>To request a refund, email us with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The email address associated with your Trackify Atlas account</li>
                  <li>Your plan (Pro or Team) and billing interval (monthly or annual)</li>
                  <li>Date of charge and approximate amount</li>
                  <li>Brief reason for the request (optional but helpful)</li>
                </ul>
                <p>
                  We aim to respond within <strong className="text-foreground">3–5 business days</strong>.
                  Approved refunds are processed to your original payment method within{" "}
                  <strong className="text-foreground">5–10 business days</strong>, depending on your bank
                  or card issuer.
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-primary" />
                5. What is not refundable
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscription renewals (second month onward), except where required by law</li>
                  <li>Charges after the 14-day money-back period from first payment</li>
                  <li>Enterprise or custom invoiced agreements (governed by your signed contract)</li>
                  <li>Free plan — no payment is collected</li>
                  <li>Accounts terminated for violation of our Terms of Service</li>
                  <li>Partial use of a billing period after the refund window has passed</li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4">6. Cancellation</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Canceling your subscription stops future charges. You can cancel from your account
                  settings or by contacting support. Cancellation is not the same as a refund; see
                  sections above for refund eligibility.
                </p>
                <p>
                  After cancellation, your account may revert to the Free plan at the end of the paid
                  period. Your data remains subject to our data retention practices described in our{" "}
                  <Link href="/privacy" className="text-primary font-medium hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4">7. Payment processing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Payments are processed securely by our payment partners (e.g. Paddle or other
                  authorized providers). Refunds are issued to the original payment method used at
                  checkout. Trackify Atlas does not store full card numbers on our servers.
                </p>
                <p>
                  If you dispute a charge with your bank (chargeback) before contacting us, we may
                  suspend your account while the dispute is resolved.
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                8. Exceptions and legal rights
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Nothing in this policy limits your statutory rights as a consumer where applicable law
                  requires a refund or cooling-off period. If local law provides greater protection, that
                  law applies.
                </p>
                <p>
                  We may update this policy from time to time. Material changes will be posted on this
                  page with an updated &quot;Last updated&quot; date.
                </p>
              </div>
            </Card>

            <Card className="p-8 border-border/50 bg-primary/5">
              <h2 className="text-2xl font-semibold mb-4">Contact us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>For refund requests or billing questions:</p>
                <p className="font-medium text-foreground">Email: billing@trackifyatlas.com</p>
                <p>
                  See also:{" "}
                  <Link href="/pricing" className="text-primary font-medium hover:underline">
                    Pricing
                  </Link>
                  {" · "}
                  <Link href="/terms" className="text-primary font-medium hover:underline">
                    Terms of Service
                  </Link>
                  {" · "}
                  <Link href="/contact" className="text-primary font-medium hover:underline">
                    Contact
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
