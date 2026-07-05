import { AI_AGENTS_CATALOG, resolveAgentId } from "@/lib/ai-agents-catalog"
import { getDefaultGroqModel } from "@/lib/agents/groq-model"
import { getSystemPrompt } from "@/lib/agents/prompts"
import { getToolGuidanceAppendix } from "@/lib/agents/prompts/tool-guidance"
import type { AgentRuntimeConfig } from "@/lib/agents/types"

const BASE_CONFIG: Omit<AgentRuntimeConfig, "systemPrompt"> = {
  model: getDefaultGroqModel(),
  maxTokens: 1024,
  temperature: 0.6,
}

export function isKnownAgentId(agentId: string): boolean {
  if (agentId === "finna") return true
  const resolved = resolveAgentId(agentId)
  return AI_AGENTS_CATALOG.some((a) => a.id === resolved)
}

export function getAgentConfig(agentId: string): AgentRuntimeConfig {
  const resolved = resolveAgentId(agentId)
  const systemPrompt =
    getSystemPrompt(resolved) + getToolGuidanceAppendix(resolved)
  return {
    ...BASE_CONFIG,
    systemPrompt,
  }
}
