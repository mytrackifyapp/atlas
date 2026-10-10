import { loadStripe } from "@stripe/stripe-js"

const stripePromises = new Map<string, ReturnType<typeof loadStripe>>()

export function getStripeJs(publishableKey: string) {
  const existing = stripePromises.get(publishableKey)
  if (existing) return existing
  const created = loadStripe(publishableKey)
  stripePromises.set(publishableKey, created)
  return created
}

const STRIPE_FONT =
  'Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

export const stripeFonts = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap",
  },
]

export const stripeAppearance = {
  theme: "stripe" as const,
  labels: "above" as const,
  variables: {
    fontFamily: STRIPE_FONT,
    fontSizeBase: "15px",
    fontSizeSm: "13px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "600",
    fontLineHeight: "1.45",
    fontSmooth: "always",
    colorPrimary: "#171717",
    colorBackground: "#ffffff",
    colorText: "#171717",
    colorTextSecondary: "#737373",
    colorTextPlaceholder: "#a3a3a3",
    colorDanger: "#dc2626",
    labelColorText: "#404040",
    labelFontSize: "13px",
    labelFontWeight: "500",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Label": {
      fontFamily: STRIPE_FONT,
      fontSize: "13px",
      fontWeight: "500",
      letterSpacing: "-0.01em",
    },
    ".Input": {
      fontFamily: STRIPE_FONT,
      fontSize: "15px",
      fontWeight: "500",
      letterSpacing: "-0.011em",
    },
    ".Input::placeholder": {
      fontFamily: STRIPE_FONT,
      fontWeight: "400",
      letterSpacing: "0",
    },
    ".Tab": {
      fontFamily: STRIPE_FONT,
      fontSize: "13px",
      fontWeight: "600",
      letterSpacing: "-0.01em",
    },
    ".TabLabel": {
      fontFamily: STRIPE_FONT,
      fontWeight: "600",
      letterSpacing: "-0.01em",
    },
    ".DropdownItem": {
      fontFamily: STRIPE_FONT,
      fontSize: "15px",
      fontWeight: "500",
    },
    ".Error": {
      fontFamily: STRIPE_FONT,
      fontSize: "13px",
      fontWeight: "500",
    },
  },
}
