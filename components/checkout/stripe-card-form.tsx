"use client"

import { useState } from "react"
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout"
import { ArrowLeft, Loader2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getStripeJs, stripeAppearance, stripeFonts } from "@/lib/stripe/appearance"

type Props = {
  publishableKey: string
  clientSecret: string
  sessionId: string
  amountLabel: string
  returnKind: "subscription" | "credits"
  onBack: () => void
  onSuccess: () => void
}

function CardPayForm({
  sessionId,
  amountLabel,
  returnKind,
  onBack,
  onSuccess,
}: Omit<Props, "publishableKey" | "clientSecret">) {
  const checkout = useCheckoutElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function pay() {
    if (checkout.type !== "success") return
    setSubmitting(true)
    setError("")
    try {
      const result = await checkout.checkout.confirm({
        returnUrl: `${window.location.origin}/checkout/success?session_id=${encodeURIComponent(sessionId)}&kind=${returnKind}`,
      })
      if (result.type === "error") {
        setError(result.error.message)
        return
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (checkout.type === "loading") {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (checkout.type === "error") {
    return <p className="text-sm text-red-600">{checkout.error.message}</p>
  }

  return (
    <div className="space-y-5">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
        }}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button
        className="h-11 w-full rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
        disabled={submitting}
        onClick={() => void pay()}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ${amountLabel}`}
      </Button>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <p className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
          <Lock className="h-3 w-3" />
          Secured by Stripe
        </p>
      </div>
    </div>
  )
}

export function StripeCardForm(props: Props) {
  return (
    <CheckoutElementsProvider
      stripe={getStripeJs(props.publishableKey)}
      options={{
        clientSecret: props.clientSecret,
        elementsOptions: { appearance: stripeAppearance, fonts: stripeFonts, loader: "auto" },
      }}
    >
      <CardPayForm
        sessionId={props.sessionId}
        amountLabel={props.amountLabel}
        returnKind={props.returnKind}
        onBack={props.onBack}
        onSuccess={props.onSuccess}
      />
    </CheckoutElementsProvider>
  )
}
