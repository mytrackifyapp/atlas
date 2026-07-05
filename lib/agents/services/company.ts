import { getDatabase } from "@/lib/db"

export type TeamMemberSummary = {
  id: string
  name: string
  role: string | null
  department: string | null
  equity: number | null
  isCoFounder: boolean
}

export type StakeholderSummary = {
  id: string
  name: string
  type: string
  equity: number | null
}

export type CompanyStructureSummary = {
  teamCount: number
  stakeholderCount: number
  teamMembers: TeamMemberSummary[]
  stakeholders: StakeholderSummary[]
  totalReportedEquity: number
}

export async function getCompanyStructure(
  userId: string
): Promise<CompanyStructureSummary> {
  const db = await getDatabase()

  const [teamMembers, stakeholders] = await Promise.all([
    db.collection("team_members").find({ userId }).sort({ createdAt: -1 }).toArray(),
    db.collection("stakeholders").find({ userId }).sort({ createdAt: -1 }).toArray(),
  ])

  const team = teamMembers.map((row) => ({
    id: row._id.toString(),
    name: row.name,
    role: row.role ?? null,
    department: row.department ?? null,
    equity: row.equity != null ? Number(row.equity) : null,
    isCoFounder: Boolean(row.isCoFounder),
  }))

  const holders = stakeholders.map((row) => ({
    id: row._id.toString(),
    name: row.name,
    type: row.type ?? "Other",
    equity: row.equity != null ? Number(row.equity) : null,
  }))

  const totalReportedEquity = [...team, ...holders].reduce(
    (sum, row) => sum + (row.equity ?? 0),
    0
  )

  return {
    teamCount: team.length,
    stakeholderCount: holders.length,
    teamMembers: team,
    stakeholders: holders,
    totalReportedEquity,
  }
}
