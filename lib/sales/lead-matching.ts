import type { SalesLead } from "@/lib/sales/types"

import { listSalesLeads } from "@/lib/sales/leads-service"

export type LeadMatch = SalesLead & {
  matchReason: "email" | "name" | "company"
  matchScore: number
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

function firstName(name: string) {
  return normalizeName(name).split(/\s+/)[0] ?? ""
}

function scoreNameMatch(query: string, leadName: string): number {
  const q = normalizeName(query)
  const n = normalizeName(leadName)
  if (!q || !n) return 0
  if (q === n) return 100
  if (n.startsWith(q) || q.startsWith(n)) return 90
  if (firstName(q) && firstName(q) === firstName(n)) return 85
  if (n.includes(q) || q.includes(n)) return 70
  return 0
}

export async function findMatchingSalesLeads(
  ownerId: string,
  query: { name?: string; email?: string; company?: string },
  limit = 5
): Promise<LeadMatch[]> {
  const matches = new Map<string, LeadMatch>()

  const email = query.email?.trim()
  const name = query.name?.trim()
  const company = query.company?.trim()

  if (email) {
    const byEmail = await listSalesLeads(ownerId, {
      search: email,
      limit: 10,
    })
    for (const lead of byEmail) {
      if (lead.email && normalizeEmail(lead.email) === normalizeEmail(email)) {
        matches.set(lead.id, {
          ...lead,
          matchReason: "email",
          matchScore: 100,
        })
      }
    }
  }

  if (name) {
    const byName = await listSalesLeads(ownerId, { search: name, limit: 15 })
    for (const lead of byName) {
      const score = scoreNameMatch(name, lead.name)
      if (score >= 70) {
        const existing = matches.get(lead.id)
        if (!existing || score > existing.matchScore) {
          matches.set(lead.id, {
            ...lead,
            matchReason: "name",
            matchScore: score,
          })
        }
      }
    }
  }

  if (company) {
    const byCompany = await listSalesLeads(ownerId, { search: company, limit: 10 })
    for (const lead of byCompany) {
      const leadCompany = lead.company.trim().toLowerCase()
      const qCompany = company.trim().toLowerCase()
      if (leadCompany === qCompany || leadCompany.includes(qCompany)) {
        const existing = matches.get(lead.id)
        const score = leadCompany === qCompany ? 80 : 65
        if (!existing || score > existing.matchScore) {
          matches.set(lead.id, {
            ...lead,
            matchReason: "company",
            matchScore: score,
          })
        }
      }
    }
  }

  return [...matches.values()]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}

export async function resolveSalesLead(
  ownerId: string,
  query: { leadId?: string; name?: string; email?: string; company?: string }
): Promise<
  | { status: "found"; lead: SalesLead }
  | { status: "ambiguous"; matches: LeadMatch[] }
  | { status: "not_found" }
> {
  if (query.leadId) {
    const { getSalesLead } = await import("@/lib/sales/leads-service")
    const lead = await getSalesLead(query.leadId, ownerId)
    return lead ? { status: "found", lead } : { status: "not_found" }
  }

  const matches = await findMatchingSalesLeads(ownerId, {
    name: query.name,
    email: query.email,
    company: query.company,
  })

  if (matches.length === 0) return { status: "not_found" }
  if (matches.length === 1 || matches[0].matchScore >= 90) {
    return { status: "found", lead: matches[0] }
  }

  const top = matches[0]
  const second = matches[1]
  if (top.matchScore - second.matchScore >= 15) {
    return { status: "found", lead: top }
  }

  return { status: "ambiguous", matches }
}
