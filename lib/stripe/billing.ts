import type Stripe from "stripe"

import { getStripe } from "@/lib/stripe/client"
import { getOrCreateStripeCustomer } from "@/lib/stripe/customers"
import type {
  BillingInvoice,
  BillingPaymentMethod,
  BillingSnapshot,
  BillingSubscription,
} from "@/lib/stripe/billing-types"

function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

function periodEndOf(subscription: Stripe.Subscription) {
  const fromItem = subscription.items.data[0]?.current_period_end
  return typeof fromItem === "number" ? fromItem : null
}

function intervalOf(subscription: Stripe.Subscription): BillingSubscription["interval"] {
  const interval = subscription.items.data[0]?.price?.recurring?.interval
  if (interval === "month") return "month"
  if (interval === "year") return "year"
  return null
}

function serializeCard(method: Stripe.PaymentMethod): BillingPaymentMethod | null {
  if (!method.card) return null
  return {
    id: method.id,
    brand: method.card.brand,
    last4: method.card.last4,
    expMonth: method.card.exp_month,
    expYear: method.card.exp_year,
  }
}

function serializeInvoice(invoice: Stripe.Invoice): BillingInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    created: invoice.created,
    invoicePdf: invoice.invoice_pdf ?? null,
  }
}

function serializeSubscription(subscription: Stripe.Subscription): BillingSubscription {
  return {
    id: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: periodEndOf(subscription),
    interval: intervalOf(subscription),
  }
}

export async function getBillingSnapshot(customerId: string | null): Promise<BillingSnapshot> {
  if (!customerId) {
    return {
      configured: true,
      customer: null,
      defaultPaymentMethodId: null,
      paymentMethods: [],
      invoices: [],
      subscription: null,
    }
  }

  const stripe = getStripe()
  const [customer, methods, invoices, subscriptions] = await Promise.all([
    stripe.customers.retrieve(customerId),
    stripe.paymentMethods.list({ customer: customerId, type: "card" }),
    stripe.invoices.list({ customer: customerId, limit: 12 }),
    stripe.subscriptions.list({ customer: customerId, status: "all", limit: 8 }),
  ])

  if ("deleted" in customer && customer.deleted) {
    return {
      configured: true,
      customer: null,
      defaultPaymentMethodId: null,
      paymentMethods: [],
      invoices: [],
      subscription: null,
    }
  }

  const liveSubscription =
    subscriptions.data.find((item) => item.status === "active" || item.status === "trialing" || item.status === "past_due") ??
    subscriptions.data[0] ??
    null

  const defaultFromCustomer = idOf(customer.invoice_settings?.default_payment_method)
  const defaultFromSubscription = liveSubscription ? idOf(liveSubscription.default_payment_method) : null

  return {
    configured: true,
    customer: {
      id: customer.id,
      name: customer.name ?? null,
      email: customer.email ?? null,
    },
    defaultPaymentMethodId: defaultFromCustomer ?? defaultFromSubscription,
    paymentMethods: methods.data.map(serializeCard).filter((item): item is BillingPaymentMethod => Boolean(item)),
    invoices: invoices.data.map(serializeInvoice),
    subscription: liveSubscription ? serializeSubscription(liveSubscription) : null,
  }
}

export async function createBillingSetupIntent(input: {
  ownerId: string
  email?: string | null
  name?: string | null
}) {
  const customer = await getOrCreateStripeCustomer(input)
  const setupIntent = await getStripe().setupIntents.create({
    customer,
    usage: "off_session",
    payment_method_types: ["card"],
  })
  if (!setupIntent.client_secret) {
    throw new Error("Stripe did not return a setup client secret")
  }
  return { clientSecret: setupIntent.client_secret, customerId: customer }
}

export async function assertPaymentMethodOwner(customerId: string, paymentMethodId: string) {
  const method = await getStripe().paymentMethods.retrieve(paymentMethodId)
  if (idOf(method.customer) !== customerId) {
    throw new Error("That card does not belong to this account")
  }
  return method
}

export async function setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
  const stripe = getStripe()
  await assertPaymentMethodOwner(customerId, paymentMethodId)
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  })
  await Promise.all(
    subscriptions.data
      .filter((item) => item.status === "active" || item.status === "trialing" || item.status === "past_due")
      .map((item) =>
        stripe.subscriptions.update(item.id, { default_payment_method: paymentMethodId }),
      ),
  )
}

export async function detachPaymentMethod(customerId: string, paymentMethodId: string) {
  await assertPaymentMethodOwner(customerId, paymentMethodId)
  await getStripe().paymentMethods.detach(paymentMethodId)
}

export async function updateBillingProfile(
  customerId: string,
  input: { name?: string; email?: string },
) {
  await getStripe().customers.update(customerId, {
    name: input.name?.trim() || undefined,
    email: input.email?.trim() || undefined,
  })
}

export async function setCancelAtPeriodEnd(
  customerId: string,
  subscriptionId: string,
  cancelAtPeriodEnd: boolean,
) {
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  if (idOf(subscription.customer) !== customerId) {
    throw new Error("That subscription does not belong to this account")
  }
  await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: cancelAtPeriodEnd })
}
