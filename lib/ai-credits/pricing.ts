import { AI_CREDIT_COSTS } from "@/lib/ai-credits/plans"
import type { AiCreditFeature } from "@/lib/ai-credits/types"

/**
 * Convert LLM token usage into Trackify AI credits.
 * Output tokens cost more than input — they drive generation cost.
 */
export function tokensToCredits(inputTokens = 0, outputTokens = 0): number {
  const inputUnits = inputTokens / 1000
  const outputUnits = outputTokens / 1000
  const raw = inputUnits * 0.35 + outputUnits * 0.75
  return Math.max(1, Math.ceil(raw))
}

export function creditsForFeature(
  feature: AiCreditFeature,
  input: {
    inputTokens?: number
    outputTokens?: number
    delegationCount?: number
    charCount?: number
  } = {},
): number {
  const tokenCredits = tokensToCredits(input.inputTokens ?? 0, input.outputTokens ?? 0)

  switch (feature) {
    case "finna_chat":
      return Math.max(AI_CREDIT_COSTS.finnaChatMin, tokenCredits)
    case "agent_chat":
      return Math.max(AI_CREDIT_COSTS.agentChatMin, tokenCredits)
    case "agent_delegation":
      return Math.max(
        AI_CREDIT_COSTS.delegationMin,
        tokenCredits + (input.delegationCount ?? 0) * AI_CREDIT_COSTS.delegationMin,
      )
    case "agent_background":
      return Math.max(AI_CREDIT_COSTS.backgroundChatMin, tokenCredits)
    case "agent_run":
      return Math.max(AI_CREDIT_COSTS.agentRunMin, tokenCredits)
    case "voice_tts": {
      const chars = input.charCount ?? 0
      const charCredits = Math.ceil(chars / 500) * AI_CREDIT_COSTS.voiceTtsPer500Chars
      return Math.max(AI_CREDIT_COSTS.voiceTtsPer500Chars, charCredits)
    }
    case "voice_stt":
      return AI_CREDIT_COSTS.voiceSttMin
    case "embedding":
      return AI_CREDIT_COSTS.embeddingMin
    default:
      return tokenCredits
  }
}

export function featureLabel(feature: AiCreditFeature): string {
  const labels: Record<AiCreditFeature, string> = {
    finna_chat: "Finna chat",
    agent_chat: "Agent chat",
    agent_delegation: "Agent delegation",
    agent_run: "Agent run",
    agent_background: "Background chat",
    voice_tts: "Voice (TTS)",
    voice_stt: "Voice (STT)",
    embedding: "Knowledge indexing",
  }
  return labels[feature]
}
