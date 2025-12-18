// Quick script to check user in database
const { MongoClient } = require("mongodb")
const fs = require("fs")
const path = require("path")

// Read .env file manually
function getEnvVar(name) {
  const envPath = path.join(__dirname, "..", ".env")
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8")
    const lines = content.split("\n")
    for (const line of lines) {
      if (line.trim().startsWith(`${name}=`)) {
        const value = line.split("=").slice(1).join("=").trim()
        // Remove quotes if present
        return value.replace(/^["']|["']$/g, "")
      }
    }
  }
  return null
}

async function checkUser() {
  const dbUrl = getEnvVar("DATABASE_URL") || "mongodb://localhost:27017/trackify-ventures"
  const client = new MongoClient(dbUrl)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log("Database name:", db.databaseName)
    
    // Get all users
    const users = await db.collection("user").find({}).toArray()
    
    console.log("\nTotal users:", users.length)
    console.log("\nUser documents:")
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`)
      console.log("  _id:", user._id?.toString())
      console.log("  id:", user.id)
      console.log("  email:", user.email)
      console.log("  name:", user.name)
      console.log("  role:", user.role)
      console.log("  onboardingCompleted:", user.onboardingCompleted)
      console.log("  All fields:", Object.keys(user))
    })
    
    // Try to find by email
    const email = "divineekoh@gmail.com"
    const userByEmail = await db.collection("user").findOne({ email })
    console.log(`\n\nFinding user by email "${email}":`, userByEmail ? "FOUND" : "NOT FOUND")
    if (userByEmail) {
      console.log("  User data:", JSON.stringify(userByEmail, null, 2))
    }
    
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await client.close()
  }
}

checkUser()

