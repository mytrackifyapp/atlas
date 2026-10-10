import { palmFetch } from "@/lib/palm/client"

export type PalmEntityType = "llc" | "corporation"

export type NameEligibilityResult = {
  eligible: boolean
  compliant: boolean
  available: boolean
  violations?: { message: string; severity?: string }[]
  alternatives?: string[]
}

export function parseEntityType(value: string | null): PalmEntityType {
  return value === "corporation" ? "corporation" : "llc"
}

export async function checkNameEligibility(input: {
  name: string
  jurisdiction: string
  entityType: PalmEntityType
}) {
  const params = new URLSearchParams({
    name: input.name,
    entity_type: input.entityType,
    suggest: "true",
  })
  return palmFetch<NameEligibilityResult>(
    `/v1/business/registry/${encodeURIComponent(input.jurisdiction)}/name-eligibility?${params.toString()}`,
  )
}
