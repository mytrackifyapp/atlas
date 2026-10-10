"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { format } from "date-fns"
import { ArrowLeft, CreditCard, Download, Loader2, Lock, Plus } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStripeJs, stripeAppearance, stripeFonts } from "@/lib/stripe/appearance"
import type { BillingSnapshot } from "@/lib/stripe/billing-types"
import { cn } from "@/lib/utils"

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function brandLabel(brand: string) {
  if (!brand) return "Card"
  return brand.charAt(0).toUpperCase() + brand.slice(1)
}

function AddCardForm({
  onCancel,
  onSaved,
  returnUrl,
}: {
  onCancel: () => void
  onSaved: (paymentMethodId: string) => Promise<void>
  returnUrl: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function save() {
    if (!stripe || !elements) return
    setSubmitting(true)
    setError("")
    try {
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      })
      if (result.error) {
        setError(result.error.message ?? "Could not save this card")
        return
      }
      const paymentMethod = result.setupIntent?.payment_method
      const paymentMethodId = typeof paymentMethod === "string" ? paymentMethod : paymentMethod?.id
      if (!paymentMethodId) {
        setError("Card was saved, but Stripe did not return a payment method")
        return
      }
      await onSaved(paymentMethodId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this card")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: { type: "tabs", defaultCollapsed: false } }} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-800"
        >
          Cancel
        </button>
        <Button
          className="rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
          disabled={submitting || !stripe}
          onClick={() => void save()}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save card"}
        </Button>
      </div>
    </div>
  )
}

export function BillingWorkspace({
  publishableKey,
  settingsHref,
}: {
  publishableKey: string
  settingsHref: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [snapshot, setSnapshot] = useState<BillingSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [setupSecret, setSetupSecret] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const returnUrl =
    typeof window === "undefined" ? pathname : `${window.location.origin}${pathname}`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/billing", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not load billing")
      setSnapshot(data)
      setName(data.customer?.name ?? "")
      setEmail(data.customer?.email ?? "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load billing")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const clientSecret = searchParams.get("setup_intent_client_secret")
    const status = searchParams.get("redirect_status")
    if (!clientSecret || !publishableKey) return

    void (async () => {
      const stripe = await getStripeJs(publishableKey)
      if (!stripe) return
      const result = await stripe.retrieveSetupIntent(clientSecret)
      const paymentMethod = result.setupIntent?.payment_method
      const paymentMethodId = typeof paymentMethod === "string" ? paymentMethod : paymentMethod?.id
      if (status === "succeeded" && paymentMethodId) {
        await fetch("/api/stripe/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "default_payment_method", paymentMethodId }),
        })
        toast.success("Card saved")
      } else if (result.setupIntent?.last_setup_error?.message) {
        toast.error(result.setupIntent.last_setup_error.message)
      }
      router.replace(pathname)
      await load()
    })()
  }, [load, pathname, publishableKey, router, searchParams])

  async function mutate(body: Record<string, unknown>, success: string) {
    setBusyId(String(body.action))
    try {
      const res = await fetch("/api/stripe/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not update billing")
      setSnapshot(data)
      if (data.customer) {
        setName(data.customer.name ?? "")
        setEmail(data.customer.email ?? "")
      }
      toast.success(success)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update billing")
    } finally {
      setBusyId(null)
    }
  }

  async function startAddCard() {
    setBusyId("add")
    try {
      const res = await fetch("/api/stripe/billing/setup", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) throw new Error(data.error || "Could not start card setup")
      setSetupSecret(data.clientSecret)
      setAdding(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start card setup")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (error || !snapshot) {
    return <p className="text-sm text-red-600">{error ?? "Could not load billing"}</p>
  }

  if (!snapshot.configured) {
    return (
      <Card className="rounded-2xl border-neutral-200/80 p-6">
        <p className="text-sm text-neutral-600">Card billing is not configured yet.</p>
      </Card>
    )
  }

  const subscription = snapshot.subscription
  const periodEnd = subscription?.currentPeriodEnd
    ? format(new Date(subscription.currentPeriodEnd * 1000), "MMM d, yyyy")
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your card, invoices, and subscription on Trackify."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href={settingsHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl border-neutral-200/80 bg-white p-5 shadow-none sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Payment method</h2>
            <p className="mt-1 text-sm text-neutral-500">Add or update the card used for your Trackify plan.</p>
          </div>
          {!adding ? (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={busyId === "add" || !publishableKey}
              onClick={() => void startAddCard()}
            >
              {busyId === "add" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add card
            </Button>
          ) : null}
        </div>

        {adding && setupSecret && publishableKey ? (
          <Elements
            stripe={getStripeJs(publishableKey)}
            options={{
              clientSecret: setupSecret,
              appearance: stripeAppearance,
              fonts: stripeFonts,
              loader: "auto",
            }}
          >
            <AddCardForm
              returnUrl={returnUrl}
              onCancel={() => {
                setAdding(false)
                setSetupSecret("")
              }}
              onSaved={async (paymentMethodId) => {
                await mutate(
                  { action: "default_payment_method", paymentMethodId },
                  "Card saved",
                )
                setAdding(false)
                setSetupSecret("")
              }}
            />
          </Elements>
        ) : snapshot.paymentMethods.length === 0 ? (
          <p className="text-sm text-neutral-500">No card on file yet.</p>
        ) : (
          <div className="space-y-2">
            {snapshot.paymentMethods.map((method) => {
              const isDefault = method.id === snapshot.defaultPaymentMethodId
              return (
                <div
                  key={method.id}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800"
                >
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                      {brandLabel(method.brand)} ···· {method.last4}
                      {isDefault ? (
                        <span className="rounded-full bg-[#c1ff72]/20 px-2 py-0.5 text-[11px] font-semibold text-neutral-800">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isDefault ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={busyId !== null}
                        onClick={() =>
                          void mutate(
                            { action: "default_payment_method", paymentMethodId: method.id },
                            "Default card updated",
                          )
                        }
                      >
                        Set default
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-red-600 hover:text-red-700"
                      disabled={busyId !== null}
                      onClick={() =>
                        void mutate(
                          { action: "detach_payment_method", paymentMethodId: method.id },
                          "Card removed",
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p className="mt-4 inline-flex items-center gap-1 text-[11px] text-neutral-400">
          <Lock className="h-3 w-3" />
          Cards are stored by Stripe. Trackify never sees the full number.
        </p>
      </Card>

      <Card className="rounded-2xl border-neutral-200/80 bg-white p-5 shadow-none sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-semibold">Billing information</h2>
        <p className="mt-1 text-sm text-neutral-500">Used on invoices and receipts.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="billing-name">Name</Label>
            <Input id="billing-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-email">Email</Label>
            <Input
              id="billing-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        <Button
          className="mt-4 rounded-full"
          variant="outline"
          disabled={busyId === "update_profile" || !snapshot.customer}
          onClick={() =>
            void mutate({ action: "update_profile", name, email }, "Billing details saved")
          }
        >
          {busyId === "update_profile" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save details
        </Button>
      </Card>

      {subscription ? (
        <Card className="rounded-2xl border-neutral-200/80 bg-white p-5 shadow-none sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-base font-semibold">Subscription</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Status{" "}
            <span className="font-medium capitalize">{subscription.status.replaceAll("_", " ")}</span>
            {subscription.interval ? ` · billed ${subscription.interval === "year" ? "annually" : "monthly"}` : ""}
            {periodEnd ? ` · ${subscription.cancelAtPeriodEnd ? "ends" : "renews"} ${periodEnd}` : ""}
          </p>
          {subscription.status === "active" || subscription.status === "trialing" ? (
            <Button
              variant="outline"
              className={cn("mt-4 rounded-full", subscription.cancelAtPeriodEnd ? "" : "text-red-600")}
              disabled={busyId === "cancel_subscription"}
              onClick={() =>
                void mutate(
                  {
                    action: "cancel_subscription",
                    subscriptionId: subscription.id,
                    cancelAtPeriodEnd: !subscription.cancelAtPeriodEnd,
                  },
                  subscription.cancelAtPeriodEnd ? "Cancellation undone" : "Subscription will end after this period",
                )
              }
            >
              {busyId === "cancel_subscription" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {subscription.cancelAtPeriodEnd ? "Keep subscription" : "Cancel at period end"}
            </Button>
          ) : null}
        </Card>
      ) : null}

      <Card className="rounded-2xl border-neutral-200/80 bg-white p-5 shadow-none sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-semibold">Invoice history</h2>
        {snapshot.invoices.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No invoices yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {snapshot.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium">
                    {invoice.number ?? "Invoice"} · {money(invoice.amountPaid, invoice.currency)}
                  </p>
                  <p className="text-xs capitalize text-neutral-500">
                    {format(new Date(invoice.created * 1000), "MMM d, yyyy")}
                    {invoice.status ? ` · ${invoice.status}` : ""}
                  </p>
                </div>
                {invoice.invoicePdf ? (
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <a href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
