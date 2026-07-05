import { tool } from "ai"
import { z } from "zod"

import {
  computeRunway,
  listFinanceAccounts,
  listFinanceTransactions,
  resolveFinanceWorkspaceId,
} from "@/lib/agents/services/finance"
import { writeAuditLog } from "@/lib/agents/services/audit"
import type { ToolContext } from "@/lib/agents/tools/types"

const workspaceIdSchema = z
  .string()
  .optional()
  .describe(
    "Finance workspace ID. Omit to use the user's most recently updated workspace."
  )

function parseOptionalInt(
  value: string | number | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  if (value === undefined || value === null || value === "") return fallback
  const n = typeof value === "number" ? value : parseInt(String(value), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

async function resolveAndVerify(ctx: ToolContext, workspaceId?: string) {
  return resolveFinanceWorkspaceId(
    ctx.userId,
    workspaceId ?? ctx.workspaceId
  )
}

async function listAccountsForTool(ctx: ToolContext, workspaceId?: string) {
  if (workspaceId?.trim() || ctx.workspaceId) {
    const wsId = await resolveAndVerify(ctx, workspaceId)
    return { workspaceId: wsId, accounts: await listFinanceAccounts(ctx.userId, wsId) }
  }
  const accounts = await listFinanceAccounts(ctx.userId)
  const wsId = accounts[0]?.workspaceId ?? (await resolveAndVerify(ctx))
  return { workspaceId: wsId, accounts }
}

async function listTransactionsForTool(
  ctx: ToolContext,
  workspaceId: string | undefined,
  accountId: string | undefined,
  limit: number
) {
  if (workspaceId?.trim() || ctx.workspaceId) {
    const wsId = await resolveAndVerify(ctx, workspaceId)
    const transactions = await listFinanceTransactions(ctx.userId, wsId, {
      accountId,
      limit,
    })
    return { workspaceId: wsId, transactions }
  }
  const transactions = await listFinanceTransactions(ctx.userId, undefined, {
    accountId,
    limit,
  })
  const wsId =
    transactions[0]?.workspaceId ??
    (await listFinanceAccounts(ctx.userId))[0]?.workspaceId ??
    (await resolveAndVerify(ctx))
  return { workspaceId: wsId, transactions }
}

async function auditToolCall(
  ctx: ToolContext,
  toolId: string,
  workspaceId: string,
  correlationId: string | undefined,
  extra?: Record<string, unknown>
) {
  await writeAuditLog({
    ownerId: ctx.userId,
    agentId: ctx.agentId,
    action: "tool.execute",
    correlationId,
    policyDecision: "allowed",
    resource: { type: "tool", id: toolId },
    metadata: { toolId, workspaceId, ...extra },
  })
}

export function createFinanceTools(ctx: ToolContext, correlationId?: string) {
  return {
    get_accounts: tool({
      description:
        "List finance accounts with balances for a workspace. Use when the user asks about cash, accounts, or balances.",
      inputSchema: z.object({
        workspaceId: workspaceIdSchema,
      }),
      execute: async ({ workspaceId }) => {
        const { workspaceId: wsId, accounts } = await listAccountsForTool(
          ctx,
          workspaceId
        )
        await auditToolCall(ctx, "get_accounts", wsId, correlationId, {
          count: accounts.length,
        })
        return { workspaceId: wsId, accounts }
      },
    }),

    get_transactions: tool({
      description:
        "List recent income and expense transactions. Use for spend analysis, burn, or cashflow questions.",
      inputSchema: z.object({
        workspaceId: workspaceIdSchema,
        accountId: z
          .string()
          .optional()
          .describe("Optional account ID to filter transactions."),
        limit: z
          .union([z.string(), z.number()])
          .optional()
          .describe("Max transactions to return (default 50)."),
      }),
      execute: async ({ workspaceId, accountId, limit }) => {
        const { workspaceId: wsId, transactions } = await listTransactionsForTool(
          ctx,
          workspaceId,
          accountId,
          parseOptionalInt(limit, 50, 1, 200)
        )
        await auditToolCall(ctx, "get_transactions", wsId, correlationId, {
          count: transactions.length,
          accountId: accountId ?? null,
        })
        return { workspaceId: wsId, transactions }
      },
    }),

    compute_runway: tool({
      description:
        "Compute cash runway from account balances and recent transaction burn. Use when the user asks about runway, burn rate, or months of cash left.",
      inputSchema: z.object({
        workspaceId: workspaceIdSchema,
        periodDays: z
          .union([z.string(), z.number()])
          .optional()
          .describe("Lookback period in days for burn calculation (default 90)."),
      }),
      execute: async ({ workspaceId, periodDays }) => {
        const wsId = workspaceId?.trim()
          ? await resolveAndVerify(ctx, workspaceId)
          : undefined
        const runway = await computeRunway(
          ctx.userId,
          wsId,
          parseOptionalInt(periodDays, 90, 30, 365)
        )
        await auditToolCall(ctx, "compute_runway", runway.workspaceId, correlationId, {
          runwayMonths: runway.runwayMonths,
          netBurnPerMonth: runway.netBurnPerMonth,
        })
        return runway
      },
    }),
  }
}

export type FinanceToolName = keyof ReturnType<typeof createFinanceTools>
