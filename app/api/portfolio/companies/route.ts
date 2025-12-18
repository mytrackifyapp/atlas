import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      industry,
      stage,
      amount,
      location,
      country,
      website,
      description,
      foundedYear,
      employeeCount,
      logo,
    } = body

    // Validate required fields
    if (!name || !industry || !stage) {
      return NextResponse.json(
        { error: "Name, industry, and stage are required" },
        { status: 400 }
      )
    }

    // Get database connection
    const db = await getDatabase()

    // Create portfolio company using MongoDB directly
    const companyData = {
      name,
      industry: industry || null,
      stage: stage || null,
      amount: amount ? parseFloat(amount) : null,
      location: location || null,
      country: country || null,
      website: website || null,
      description: description || null,
      foundedYear: foundedYear || null,
      employeeCount: employeeCount || null,
      logo: logo || null, // Store logo URL from UploadThing
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("portfolio_companies").insertOne(companyData)
    
    const company = {
      id: result.insertedId.toString(),
      ...companyData,
    }

    return NextResponse.json(
      {
        success: true,
        company,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating portfolio company:", error)
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get database connection
    const db = await getDatabase()

    // Get all portfolio companies
    const companies = await db
      .collection("portfolio_companies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Transform MongoDB documents to match expected format
    const transformedCompanies = companies.map((company) => ({
      id: company._id.toString(),
      name: company.name,
      industry: company.industry,
      stage: company.stage,
      amount: company.amount,
      location: company.location,
      country: company.country,
      website: company.website,
      description: company.description,
      foundedYear: company.foundedYear,
      employeeCount: company.employeeCount,
      logo: company.logo,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      companies: transformedCompanies,
    })
  } catch (error) {
    console.error("Error fetching portfolio companies:", error)
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}

