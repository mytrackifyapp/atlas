import type { AutonomyTier, ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export type PolicyDecision = "allowed" | "denied" | "approval_required"

export type PolicyResult = {
  decision: PolicyDecision
  reason?: string
  autonomyTier?: AutonomyTier
}

export function evaluateToolPolicy(
  policy: ToolPolicy,
  ctx: ToolContext
): PolicyResult {
  if (!policy.allowedAgents.includes(ctx.agentId)) {
    return {
      decision: "denied",
      reason: `Agent ${ctx.agentId} is not allowed to use tool ${policy.id}`,
      autonomyTier: policy.autonomyTier,
    }
  }

  if (policy.approvalRequired || policy.autonomyTier === "T2" || policy.autonomyTier === "T3") {
    if (policy.approvalRequired || policy.autonomyTier === "T2") {
      return {
        decision: "approval_required",
        reason: `Tool ${policy.id} requires human approval before execution`,
        autonomyTier: policy.autonomyTier,
      }
    }
  }

  return {
    decision: "allowed",
    autonomyTier: policy.autonomyTier,
  }
}

export function tierAllowsAutonomousExecution(tier: AutonomyTier): boolean {
  return tier === "T0" || tier === "T1" || tier === "T3"
}
