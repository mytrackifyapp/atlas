import { getAgentFoundationConfig } from "@/lib/agents/foundation-config"
import { resolveAgentId } from "@/lib/ai-agents-catalog"

export type FoundationAttachment = {
  id: string
  name: string
  url: string
  mimeType?: string
  sizeBytes?: number
  uploadedAt?: string
}

export type AgentFoundationRecord = {
  agentId: string
  fields: Record<string, string>
  connectedTools: string[]
  attachments: FoundationAttachment[]
  updatedAt?: string
}

export function foundationIsConfigured(foundation: AgentFoundationRecord | null): boolean {
  if (!foundation) return false
  const hasField = Object.values(foundation.fields).some((v) => v.trim().length > 0)
  return hasField || foundation.connectedTools.length > 0 || foundation.attachments.length > 0
}

export function formatFoundationForPrompt(
  agentId: string,
  foundation: AgentFoundationRecord | null,
): string {
  if (!foundation) return ""

  const config = getAgentFoundationConfig(agentId)
  const lines: string[] = []

  for (const field of config.fields) {
    const value = foundation.fields[field.key]?.trim()
    if (value) lines.push(`- ${field.label}: ${value}`)
  }

  const tools = foundation.connectedTools.filter(Boolean)
  if (tools.length > 0) {
    lines.push(`- Connected tools & integrations: ${tools.join(", ")}`)
  }

  const attachments = foundation.attachments.filter((file) => file.url?.trim())
  if (attachments.length > 0) {
    lines.push(
      `- Uploaded sales files: ${attachments.map((file) => `${file.name} (${file.url})`).join("; ")}`,
    )
    lines.push(
      "- Use knowledge search to pull details from uploaded setup files when drafting outreach or answering product questions.",
    )
  }

  if (lines.length === 0) return ""

  return `\n\nUser-defined agent setup (always honor this context for ${resolveAgentId(agentId)}):
${lines.join("\n")}`
}
