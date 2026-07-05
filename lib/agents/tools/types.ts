export type AutonomyTier = "T0" | "T1" | "T2" | "T3"

export type ToolSideEffect = "none" | "read" | "write" | "external"

export type ToolContext = {
  userId: string
  agentId: string
  workspaceId?: string
  userRole?: string | null
}

export type ToolPolicy = {
  id: string
  autonomyTier: AutonomyTier
  sideEffect: ToolSideEffect
  allowedAgents: string[]
  approvalRequired?: boolean
}
