/** Detect when the user wants a visual / social design (flyer, graphic, post, etc.) */
export function isSocialDesignRequest(message: string): boolean {
  const text = message.toLowerCase().trim()
  if (!text) return false

  const patterns = [
    /\b(design|designs|designed)\b/,
    /\b(flyer|flyers|poster|posters)\b/,
    /\b(graphic|graphics|visual|visuals)\b/,
    /\b(instagram|linkedin|twitter|social)\s*(post|story|carousel|feed|content)?\b/,
    /\b(carousel|content\s*flyer|marketing\s*asset|brand\s*asset)\b/,
    /\b(create|make|generate|build|draft)\s+(a\s+)?(post|graphic|flyer|design|carousel|image|png|creative)\b/,
    /\b(branded\s+(post|graphic|image|content))\b/,
    /\b(sociyell|editorial_photo|branding_graphic|photo_launch)\b/,
  ]

  return patterns.some((p) => p.test(text))
}

const FILLER_WORDS =
  /\b(make|create|generate|build|draft|me|a|an|the|please|can you|could you|i need|i want|want|some|new|branded|social|content|marketing|asset|visual|graphic|graphics|design|designs|flyer|flyers|post|posts|image|png|creative|carousel|something|nice|cool|good|great|for|my|our|us|company|startup|business)\b/gi

const SUBSTANTIVE_TOPIC =
  /\b(launch|launched|funding|fundraising|fundrais|milestone|feature|tip|tips|announce|announcing|raised|raise|revenue|customers|users|product|pitch|webinar|event|hiring|team|culture|seed|series\s+[a-d]|mrr|arr|growth|insight|lesson|playbook|strategy|web3|saas|b2b|b2c)\b/i

export const SOCIAL_DRAFT_CLARIFY_QUESTIONS = [
  "Which platform — LinkedIn, Instagram, or Instagram Story?",
  "What's the one-line hook or topic? (e.g. seed round, product launch, branding tip)",
  "Any preference: photo-led Instagram (editorial) or graphic carousel slide (branding)?",
]

/** Vague design ask — must clarify before drafting */
export function isVagueSocialDesignRequest(message: string): boolean {
  if (!isSocialDesignRequest(message)) return false

  const text = message.toLowerCase().trim()

  if (
    /\b(just\s+(go|make|create|do)|don'?t\s+ask|no\s+questions|use your best|skip the questions|whatever you think)\b/.test(
      text
    )
  ) {
    return false
  }

  const hasPlatform =
    /\b(linkedin|instagram(?:\s*story)?|twitter|ig\b|insta\b)\b/.test(text)

  const stripped = text.replace(FILLER_WORDS, " ").replace(/\s+/g, " ").trim()
  const hasSubstantiveTopic =
    stripped.length >= 14 || SUBSTANTIVE_TOPIC.test(text)

  return !(hasPlatform && hasSubstantiveTopic)
}

const GENERIC_HEADLINES = new Set([
  "launch announcement",
  "your headline here",
  "brand insight",
  "new feature",
  "milestone reached",
  "make me a design",
  "design",
  "graphic",
  "social post",
])

function normalizeForCompare(value: string): string {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim()
}

export function isGenericSocialHeadline(headline: string | undefined): boolean {
  if (!headline?.trim()) return true
  const normalized = normalizeForCompare(headline)
  if (GENERIC_HEADLINES.has(normalized)) return true
  if (normalized.length < 12 && isVagueSocialDesignRequest(normalized)) return true
  return false
}

/** Block draft_social_post when the brief is too thin */
export function shouldBlockVagueSocialDraft(input: {
  caption: string
  userRequest?: string
  headline?: string
}): { block: boolean; questions: string[]; reason: string } {
  const questions = SOCIAL_DRAFT_CLARIFY_QUESTIONS

  if (input.userRequest && isVagueSocialDesignRequest(input.userRequest)) {
    return {
      block: true,
      questions,
      reason: "User request is too vague — ask clarifying questions first.",
    }
  }

  if (isVagueSocialDesignRequest(input.caption)) {
    return {
      block: true,
      questions,
      reason: "Caption mirrors a vague request — ask clarifying questions first.",
    }
  }

  if (isGenericSocialHeadline(input.headline)) {
    return {
      block: true,
      questions,
      reason: "Headline is missing or generic — ask for platform and hook first.",
    }
  }

  return { block: false, questions: [], reason: "" }
}

/** Assistant reply likely created or referenced a social draft */
export function assistantMentionsSocialDraft(content: string): boolean {
  const text = content.toLowerCase()
  if (text.includes("needsclarification") || text.includes("needs clarification")) {
    return false
  }
  return (
    text.includes("/founder/social") ||
    text.includes("founder/social") ||
    text.includes("reviewpath") ||
    text.includes("asseturl") ||
    text.includes("draft_social_post") ||
    /\b(rendered|your draft|social draft|view (your )?draft|png (is )?ready|graphic is ready)\b/.test(
      text
    )
  )
}

export const SOCIAL_DRAFTS_PATH = "/founder/social"

export function socialDesignClarificationPrompt(userMessage: string): string {
  return `
IMPORTANT — The user's latest message is a VAGUE design/content request ("${userMessage.slice(0, 120)}").
Do NOT call draft_social_post, render_social_asset, or resolve_background_image in this turn.
Reply with 2–3 short clarifying questions only:
1. Platform (LinkedIn, Instagram, or Instagram Story)
2. Main hook / topic (one line)
3. Optional: photo-led vs graphic carousel style
Keep it friendly and concise. Wait for their answer before creating anything.`
}
