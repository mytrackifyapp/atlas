import { MongoClient, Db } from "mongodb"

const connectionString = process.env.DATABASE_URL || "mongodb://localhost:27017/trackify-ventures"

// Extract database name from connection string
function getDatabaseName(connectionString: string): string {
  try {
    const url = new URL(connectionString.replace(/^mongodb\+srv:/, "mongodb:"))
    const pathname = url.pathname
    // Remove leading slash and get database name
    const dbName = pathname.split("/")[1]?.split("?")[0] || "trackify-ventures"
    return dbName
  } catch {
    // Fallback: try to extract from connection string manually
    const match = connectionString.match(/\/([^/?]+)(\?|$)/)
    return match ? match[1] : "trackify-ventures"
  }
}

const databaseName = getDatabaseName(connectionString)

let client: MongoClient | null = null
let db: Db | null = null

export async function getDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  if (!client) {
    client = new MongoClient(connectionString)
    await client.connect()
  }

  // Explicitly specify the database name
  db = client.db(databaseName)
  return db
}

// For cleanup if needed
export async function closeDatabase() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

