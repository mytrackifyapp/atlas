export type BillingPaymentMethod = {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export type BillingInvoice = {
  id: string
  number: string | null
  status: string | null
  amountPaid: number
  currency: string
  created: number
  invoicePdf: string | null
}

export type BillingSubscription = {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: number | null
  interval: "month" | "year" | null
}

export type BillingSnapshot = {
  configured: boolean
  customer: { id: string; name: string | null; email: string | null } | null
  defaultPaymentMethodId: string | null
  paymentMethods: BillingPaymentMethod[]
  invoices: BillingInvoice[]
  subscription: BillingSubscription | null
}
