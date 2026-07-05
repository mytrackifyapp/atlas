export type AgentMessageRole = "user" | "assistant" | "system" | "tool"

export type AgentChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type AgentConversation = {
  id: string
  ownerId: string
  agentId: string
  title?: string
  createdAt: Date
  updatedAt: Date
}

export type AgentMessage = {
  id: string
  conversationId: string
  ownerId: string
  agentId: string
  role: AgentMessageRole
  content: string
  metadata?: {
    model?: string
    tokenUsage?: { input?: number; output?: number }
  }
  createdAt: Date
}

export type PolicyDecision = "allowed" | "denied" | "approval_required"

export type AgentAuditEntry = {
  ownerId: string
  agentId: string
  action: string
  actorType?: "user" | "agent" | "system"
  actorId?: string
  conversationId?: string
  correlationId?: string
  model?: string
  resource?: { type: string; id?: string }
  policyDecision?: PolicyDecision
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type AgentRuntimeConfig = {
  model: string
  maxTokens: number
  temperature: number
  systemPrompt: string
}

export type AgentRunStatus =
  | "planned"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled"

export type AgentRun = {
  id: string
  ownerId: string
  agentId: string
  taskType: string
  status: AgentRunStatus
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  correlationId?: string
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type AgentApprovalStatus = "pending" | "approved" | "rejected"

export type AgentApproval = {
  id: string
  ownerId: string
  agentId: string
  toolId: string
  status: AgentApprovalStatus
  correlationId?: string
  runId?: string
  input?: Record<string, unknown>
  reason?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type AgentEventType =
  | "delegation.requested"
  | "delegation.completed"
  | "delegation.failed"
  | "handoff.suggested"

export type AgentEvent = {
  id: string
  ownerId: string
  type: AgentEventType
  fromAgentId: string
  toAgentId?: string
  correlationId?: string
  conversationId?: string
  runId?: string
  payload?: Record<string, unknown>
  createdAt: Date
}
