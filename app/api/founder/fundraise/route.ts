import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { listFundraisePayments } from "@/lib/fundraising/service"
import { getPlatformFeeSummary, listPendingSettlementGroups, listPlatformFees, syncMissingPlatformFeesForFundraise } from "@/lib/fundraising/platform-fees"
import { getFounderPublicProfile } from "@/lib/founder/profile"
import { getUserWallet } from "@/lib/wallets/service"

function serializeFundraise(fundraise: Record<string, unknown>, extras: {
  percentage: number
  daysRemaining: number
  fundraisingData: Array<{ month: string; raised: number }>
}) {
  return {
    id: String(fundraise._id),
    companyName: fundraise.companyName ?? "",
    tagline: fundraise.tagline ?? "",
    website: fundraise.website ?? "",
    headquarters: fundraise.headquarters ?? "",
    teamSize: fundraise.teamSize ?? "",
    executiveSummary: fundraise.executiveSummary ?? "",
    demoVideoUrl: fundraise.demoVideoUrl ?? "",
    dataRoomUrl: fundraise.dataRoomUrl ?? "",
    companyLogo: fundraise.companyLogo ?? null,
    coverImage: fundraise.coverImage ?? null,
    roundType: fundraise.roundType,
    targetAmount: fundraise.targetAmount,
    committedAmount: fundraise.committedAmount || 0,
    percentage: extras.percentage,
    preMoneyValuation: fundraise.preMoneyValuation,
    minInvestment: fundraise.minInvestment,
    maxInvestment: fundraise.maxInvestment,
    receivingWalletAddress: fundraise.receivingWalletAddress ?? null,
    receivingChainId: fundraise.receivingChainId ?? null,
    receivingChainLabel: fundraise.receivingChainLabel ?? null,
    startDate: fundraise.startDate,
    targetCloseDate: fundraise.targetCloseDate,
    useOfFunds: fundraise.useOfFunds || [],
    useOfFundsBreakdown: fundraise.useOfFundsBreakdown,
    companyDescription: fundraise.companyDescription,
    traction: fundraise.traction,
    marketOpportunity: fundraise.marketOpportunity,
    competitiveAdvantage: fundraise.competitiveAdvantage,
    pitchDeck: fundraise.pitchDeck,
    financialModel: fundraise.financialModel,
    status: fundraise.status,
    daysRemaining: extras.daysRemaining,
    fundraisingData: extras.fundraisingData,
    createdAt: fundraise.createdAt,
    updatedAt: fundraise.updatedAt,
  }
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

async function withFounderProfile<T extends Record<string, unknown>>(payload: T, userId: string) {
  const founder = await getFounderPublicProfile(userId)
  return {
    ...payload,
    founderName: founder.founderName,
    founderTitle: founder.founderTitle,
    founderBio: founder.founderBio,
    founderPhoto: founder.founderPhoto,
    founderVerified: founder.founderVerified,
    founderKyc: founder.founderKyc,
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = session.user.id

    // Get active fundraise
    const fundraise = await db.collection("fundraises").findOne({
      userId,
      status: "active",
    })

    if (!fundraise) {
      return NextResponse.json({
        success: true,
        fundraise: null,
      })
    }

    // Calculate fundraising progress over time (last 6 months)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return {
        month: date.toLocaleString("en-US", { month: "short" }),
        date,
      }
    })

    // Get investor interests to calculate progress over time
    const investorInterests = await db
      .collection("investor_interests")
      .find({
        fundraiseId: fundraise._id.toString(),
        createdAt: { $gte: sixMonthsAgo },
      })
      .sort({ createdAt: 1 })
      .toArray()

    // Calculate cumulative raised amount by month
    const fundraisingData = months.map(({ month, date }) => {
      const committedByMonth = investorInterests
        .filter((interest) => {
          const interestDate = interest.createdAt instanceof Date ? interest.createdAt : new Date(interest.createdAt)
          return interestDate <= date && interest.status === "Committed"
        })
        .reduce((sum, interest) => sum + (interest.amount || 0), 0)

      return {
        month,
        raised: committedByMonth,
      }
    })

    // Calculate percentage
    const percentage = fundraise.targetAmount > 0
      ? Math.round((fundraise.committedAmount / fundraise.targetAmount) * 100)
      : 0

    // Calculate days remaining
    const targetCloseDate = fundraise.targetCloseDate instanceof Date
      ? fundraise.targetCloseDate
      : new Date(fundraise.targetCloseDate)
    const daysRemaining = Math.max(0, Math.ceil((targetCloseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    const fundraiseId = fundraise._id.toString()
    await syncMissingPlatformFeesForFundraise(fundraiseId, userId)

    return NextResponse.json({
      success: true,
      fundraise: await withFounderProfile(
        serializeFundraise(fundraise, { percentage, daysRemaining, fundraisingData }),
        userId,
      ),
      payments: await listFundraisePayments(fundraiseId, 10),
      platformFees: {
        summary: await getPlatformFeeSummary(fundraiseId),
        fees: await listPlatformFees(fundraiseId, 20),
        settlementGroups: await listPendingSettlementGroups(fundraiseId),
      },
    })
  } catch (error) {
    console.error("Error fetching fundraise:", error)
    return NextResponse.json({ error: "Failed to fetch fundraise" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      tagline,
      website,
      headquarters,
      teamSize,
      executiveSummary,
      demoVideoUrl,
      dataRoomUrl,
      companyLogo,
      coverImage,
      roundType,
      targetAmount,
      preMoneyValuation,
      minInvestment,
      maxInvestment,
      startDate,
      targetCloseDate,
      useOfFunds,
      useOfFundsBreakdown,
      companyDescription,
      traction,
      marketOpportunity,
      competitiveAdvantage,
      pitchDeck,
      financialModel,
    } = body

    // Validate required fields
    if (!roundType || !targetAmount || !targetCloseDate) {
      return NextResponse.json(
        { error: "Round type, target amount, and target close date are required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id
    const savedWallet = await getUserWallet(userId)

    // Check if there's already an active fundraise
    const existingActive = await db.collection("fundraises").findOne({
      userId,
      status: "active",
    })

    if (existingActive) {
      return NextResponse.json(
        { error: "You already have an active fundraise. Please close it before starting a new one." },
        { status: 400 }
      )
    }

    // Create fundraise document
    const fundraiseData = {
      userId,
      companyName: companyName?.trim() || "",
      tagline: tagline?.trim() || "",
      website: website?.trim() || "",
      headquarters: headquarters?.trim() || "",
      teamSize: teamSize?.trim() || "",
      executiveSummary: executiveSummary?.trim() || "",
      demoVideoUrl: demoVideoUrl?.trim() || "",
      dataRoomUrl: dataRoomUrl?.trim() || "",
      companyLogo: companyLogo || null,
      coverImage: coverImage || null,
      roundType,
      targetAmount: parseFloat(targetAmount),
      preMoneyValuation: preMoneyValuation ? parseFloat(preMoneyValuation) : null,
      minInvestment: minInvestment ? parseFloat(minInvestment) : null,
      maxInvestment: maxInvestment ? parseFloat(maxInvestment) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      targetCloseDate: new Date(targetCloseDate),
      useOfFunds: useOfFunds || [],
      useOfFundsBreakdown: useOfFundsBreakdown || "",
      companyDescription: companyDescription || "",
      traction: traction || "",
      marketOpportunity: marketOpportunity || "",
      competitiveAdvantage: competitiveAdvantage || "",
      pitchDeck: pitchDeck || null,
      financialModel: financialModel || null,
      committedAmount: 0,
      receivingWalletAddress: savedWallet?.address.toLowerCase() ?? null,
      receivingChainId: savedWallet?.chainId ?? null,
      receivingChainLabel: savedWallet?.chainLabel ?? null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("fundraises").insertOne(fundraiseData)

    const fundraise = {
      id: result.insertedId.toString(),
      ...fundraiseData,
    }

    return NextResponse.json(
      {
        success: true,
        fundraise,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating fundraise:", error)
    return NextResponse.json({ error: "Failed to create fundraise" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      tagline,
      website,
      headquarters,
      teamSize,
      executiveSummary,
      demoVideoUrl,
      dataRoomUrl,
      companyLogo,
      coverImage,
      roundType,
      targetAmount,
      preMoneyValuation,
      minInvestment,
      maxInvestment,
      startDate,
      targetCloseDate,
      useOfFunds,
      useOfFundsBreakdown,
      companyDescription,
      traction,
      marketOpportunity,
      competitiveAdvantage,
      pitchDeck,
      financialModel,
    } = body

    if (!roundType || !targetAmount || !targetCloseDate) {
      return NextResponse.json(
        { error: "Round type, target amount, and target close date are required" },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    const existing = await db.collection("fundraises").findOne({
      userId,
      status: "active",
    })

    if (!existing) {
      return NextResponse.json({ error: "No active fundraise found" }, { status: 404 })
    }

    const updates = {
      companyName: companyName?.trim() || "",
      tagline: tagline?.trim() || "",
      website: website?.trim() || "",
      headquarters: headquarters?.trim() || "",
      teamSize: teamSize?.trim() || "",
      executiveSummary: executiveSummary?.trim() || "",
      demoVideoUrl: demoVideoUrl?.trim() || "",
      dataRoomUrl: dataRoomUrl?.trim() || "",
      companyLogo: companyLogo || null,
      coverImage: coverImage || null,
      roundType,
      targetAmount: parseFloat(String(targetAmount)),
      preMoneyValuation: parseOptionalNumber(preMoneyValuation),
      minInvestment: parseOptionalNumber(minInvestment),
      maxInvestment: parseOptionalNumber(maxInvestment),
      startDate: startDate ? new Date(startDate) : existing.startDate,
      targetCloseDate: new Date(targetCloseDate),
      useOfFunds: useOfFunds || [],
      useOfFundsBreakdown: useOfFundsBreakdown || "",
      companyDescription: companyDescription || "",
      traction: traction || "",
      marketOpportunity: marketOpportunity || "",
      competitiveAdvantage: competitiveAdvantage || "",
      pitchDeck: pitchDeck || null,
      financialModel: financialModel || null,
      updatedAt: new Date(),
    }

    await db.collection("fundraises").updateOne(
      { _id: existing._id },
      { $set: updates },
    )

    const percentage =
      updates.targetAmount > 0
        ? Math.round(((existing.committedAmount as number) || 0) / updates.targetAmount * 100)
        : 0

    const targetClose =
      updates.targetCloseDate instanceof Date
        ? updates.targetCloseDate
        : new Date(updates.targetCloseDate)
    const daysRemaining = Math.max(
      0,
      Math.ceil((targetClose.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    )

    return NextResponse.json({
      success: true,
      fundraise: await withFounderProfile(
        serializeFundraise(
          { ...existing, ...updates, committedAmount: existing.committedAmount },
          { percentage, daysRemaining, fundraisingData: [] },
        ),
        session.user.id,
      ),
    })
  } catch (error) {
    console.error("Error updating fundraise:", error)
    return NextResponse.json({ error: "Failed to update fundraise" }, { status: 500 })
  }
}

