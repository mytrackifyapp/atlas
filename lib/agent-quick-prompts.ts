import { resolveAgentId } from "@/lib/ai-agents-catalog"

const PROMPTS_BY_AGENT: Record<string, string[]> = {
  "ai-cfo": [
    "Build me a 12-month runway plan (assume $12k MRR, 60% gross margin).",
    "What should be in our Series A data room?",
    "Help me craft a fundraising narrative for our current metrics.",
    "Draft a monthly investor update from these highlights.",
    "Outline a competitive landscape for African fintech.",
  ],
  "ai-lawyer": [
    "What should a standard SAFE include for a seed round?",
    "Draft a simple privacy policy outline for our startup.",
    "Review key risks in a mutual NDA for a startup.",
    "Give me a startup security checklist for our seed stage.",
  ],
  "ai-sales-rep": [
    "Find Divine in my CRM and draft a follow-up email.",
    "Draft a partner outreach email for a strategic integration.",
    "Who in my pipeline needs follow-up this week?",
  ],
  "ai-marketer": [
    "Create a LinkedIn branding_graphic carousel slide about our value prop — slide 1 of 5.",
    "Build a GTM plan for launching in Nigeria with 3 channel experiments.",
    "Plan a 4-week content calendar for LinkedIn.",
    "Make an editorial_photo Instagram post for our product launch.",
  ],
  "ai-ops-manager": [
    "Draft an SOP for our weekly customer onboarding handoff.",
    "Compare three vendor options for our CRM migration.",
    "Summarize my top priorities for this week from our goals.",
  ],
  "ai-hr": [
    "Write a job description for a founding engineer.",
    "Give me behavioral interview questions for a head of sales.",
    "Suggest a light team wellness routine for a fast-paced startup.",
  ],
}

const DEFAULT_PROMPTS = [
  "What can you help me with today?",
  "Summarize the top 3 things I should focus on this week.",
  "What data from my Trackify workspace can you use?",
]

export function getQuickPromptsForAgent(agentId: string): string[] {
  const resolved = resolveAgentId(agentId)
  return PROMPTS_BY_AGENT[resolved] ?? DEFAULT_PROMPTS
}
