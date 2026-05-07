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

// Global client instance to reuse across requests (Next.js pattern)
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient
  _mongoClientPromise?: Promise<MongoClient>
}

function createClient() {
  return new MongoClient(connectionString, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
  })
}

function getClientPromise() {
  // IMPORTANT: Cache in globalThis for BOTH dev and prod.
  // Vercel lambdas can reuse a warm instance, and we must never close the shared client
  // during a request (closing it causes "MongoTopologyClosedError: Topology is closed").
  if (!globalForMongo._mongoClientPromise) {
    const client = createClient()
    globalForMongo._mongoClientPromise = client.connect().then((connected) => {
      globalForMongo._mongoClient = connected
      console.log("MongoDB connected successfully (db.ts)")
      return connected
    })
  }
  return globalForMongo._mongoClientPromise
}

let clientPromise = getClientPromise()

export async function getDatabase(): Promise<Db> {
  try {
    const connectedClient = await clientPromise
    return connectedClient.db(databaseName)
  } catch (error) {
    console.error("Error getting database connection:", error)
    // Try to create a NEW cached client promise.
    try {
      globalForMongo._mongoClientPromise = undefined
      globalForMongo._mongoClient = undefined
      clientPromise = getClientPromise()
      const connectedClient = await clientPromise
      return connectedClient.db(databaseName)
    } catch (reconnectError) {
      console.error("Failed to reconnect to MongoDB:", reconnectError)
      throw reconnectError
    }
  }
}

// For cleanup if needed
export async function closeDatabase() {
  try {
    // Intentionally a no-op in serverless/runtime code paths.
    // Closing the cached client can break concurrent requests.
    return
  } catch (error) {
    console.error("Error closing database connection:", error)
  }
}

