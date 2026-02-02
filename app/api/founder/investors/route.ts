import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = session.user.id

    // Get active fundraise for this user
    const fundraise = await db.collection("fundraises").findOne({
      userId,
      status: "active",
    })

    if (!fundraise) {
      return NextResponse.json({
        success: true,
        investors: [],
        stats: {
          total: 0,
          committed: 0,
          inDiscussion: 0,
          interested: 0,
        },
      })
    }

    // Get all investors for this fundraise
    const investors = await db
      .collection("investor_interests")
      .find({
        fundraiseId: fundraise._id.toString(),
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Calculate stats
    const stats = {
      total: investors.length,
      committed: investors.filter((inv) => inv.status === "Committed").length,
      inDiscussion: investors.filter((inv) => inv.status === "In Discussion").length,
      interested: investors.filter((inv) => inv.status === "Interested").length,
    }

    // Transform investors
    const transformedInvestors = investors.map((investor) => ({
      id: investor._id.toString(),
      name: investor.name,
      email: investor.email,
      phone: investor.phone,
      firm: investor.firm,
      title: investor.title,
      amount: investor.amount || 0,
      status: investor.status,
      stage: investor.stage,
      notes: investor.notes,
      lastContact: investor.lastContact,
      avatar: investor.avatar,
      createdAt: investor.createdAt,
      updatedAt: investor.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      investors: transformedInvestors,
      stats,
    })
  } catch (error) {
    console.error("Error fetching investors:", error)
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 })
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
      name,
      email,
      phone,
      firm,
      title,
      amount,
      stage,
      status,
      notes,
      lastContact,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Investor name is required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    // Get active fundraise
    const fundraise = await db.collection("fundraises").findOne({
      userId,
      status: "active",
    })

    if (!fundraise) {
      return NextResponse.json(
        { error: "No active fundraise found. Please start a fundraise first." },
        { status: 400 }
      )
    }

    // Create investor interest document
    const investorData = {
      fundraiseId: fundraise._id.toString(),
      userId,
      name,
      email: email || null,
      phone: phone || null,
      firm: firm || null,
      title: title || null,
      amount: amount ? parseFloat(amount) : null,
      stage: stage || "Initial Contact",
      status: status || "Interested",
      notes: notes || null,
      lastContact: lastContact ? new Date(lastContact) : new Date(),
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("investor_interests").insertOne(investorData)

    // If status is "Committed", update fundraise committedAmount
    if (status === "Committed" && amount) {
      await db.collection("fundraises").updateOne(
        { _id: fundraise._id },
        {
          $inc: { committedAmount: parseFloat(amount) },
          $set: { updatedAt: new Date() },
        }
      )
    }

    const investor = {
      id: result.insertedId.toString(),
      ...investorData,
    }

    return NextResponse.json(
      {
        success: true,
        investor,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating investor:", error)
    return NextResponse.json({ error: "Failed to create investor" }, { status: 500 })
  }
}

