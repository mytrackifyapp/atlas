export const FINNA_PUBLIC_SUGGESTIONS = [
  "What is Trackify?",
  "How do I get started?",
  "What are the pricing plans?",
  "How does investor deal flow work?",
]

export const FINNA_FOUNDER_SUGGESTIONS = [
  "Analyze my runway",
  "Which expenses increased?",
  "How is my fundraise tracking?",
  "What's in my sales pipeline?",
]

export const FINNA_INVESTOR_SUGGESTIONS = [
  "Summarize my deal flow",
  "What's my cash position?",
  "Which deals need attention?",
  "How do I use the portfolio dashboard?",
]

export function getFinnaSuggestions(role?: string | null): string[] {
  if (role === "investor") return FINNA_INVESTOR_SUGGESTIONS
  if (role) return FINNA_FOUNDER_SUGGESTIONS
  return FINNA_PUBLIC_SUGGESTIONS
}

export function getFinnaTagline(role?: string | null): string {
  if (role === "investor") {
    return "Your operating partner for portfolio, deal flow, and finance"
  }
  if (role) {
    return "Your operating partner for finance, fundraising, and the business"
  }
  return "Your Trackify assistant"
}

export function getFinnaIntro(role?: string | null): string {
  if (role === "investor") {
    return "Ask about deal flow, cash, diligence, or anything in your investor workspace."
  }
  if (role) {
    return "Ask about runway, expenses, fundraising, sales, or anything in your company workspace."
  }
  return "Ask me about Trackify, your dashboard, fundraising, or the African startup ecosystem."
}
