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

    // Get all updates for this user
    const updates = await db
      .collection("investor_updates")
      .find({ userId })
      .sort({ sentAt: -1 })
      .toArray()

    const transformedUpdates = updates.map((update) => ({
      id: update._id.toString(),
      title: update.title,
      content: update.content,
      recipients: update.recipients || [],
      sentAt: update.sentAt,
      status: update.status || "sent",
      metrics: update.metrics || {},
    }))

    return NextResponse.json({
      success: true,
      updates: transformedUpdates,
    })
  } catch (error) {
    console.error("Error fetching updates:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, recipients, metrics } = body

    // Validate required fields
    if (!title || !content || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "Title, content, and at least one recipient are required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    // Verify recipients are valid investors for this user
    const fundraise = await db.collection("fundraises").findOne({
      userId,
      status: "active",
    })

    if (!fundraise) {
      return NextResponse.json(
        { error: "No active fundraise found" },
        { status: 400 }
      )
    }

    // Verify all recipients are valid investor IDs
    const validInvestors = await db
      .collection("investor_interests")
      .find({
        fundraiseId: fundraise._id.toString(),
        _id: { $in: recipients.map((id: string) => new ObjectId(id)) },
        status: "Committed",
      })
      .toArray()

    if (validInvestors.length !== recipients.length) {
      return NextResponse.json(
        { error: "Some selected investors are invalid or not committed" },
        { status: 400 }
      )
    }

    // Create update document
    const updateData = {
      userId,
      fundraiseId: fundraise._id.toString(),
      title,
      content,
      recipients: recipients.map((id: string) => id),
      metrics: metrics || {},
      status: "sent",
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("investor_updates").insertOne(updateData)

    // TODO: Send email notifications to recipients
    // This would integrate with an email service like SendGrid, Resend, etc.

    const update = {
      id: result.insertedId.toString(),
      ...updateData,
    }

    return NextResponse.json(
      {
        success: true,
        update,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating update:", error)
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 })
  }
}
