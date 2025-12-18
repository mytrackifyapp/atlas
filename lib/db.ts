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

// Create MongoDB client with proper connection options for Atlas
const client = new MongoClient(connectionString, {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
})

// Global client instance to reuse across requests (Next.js pattern)
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient
  _mongoClientPromise?: Promise<MongoClient>
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the client is not recreated on hot reloads
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error("Failed to connect to MongoDB:", error)
      return client
    })
  }
  clientPromise = globalForMongo._mongoClientPromise
} else {
  // In production, create connection promise
  clientPromise = client.connect().catch((error) => {
    console.error("Failed to connect to MongoDB:", error)
    return client
  })
}

// Initialize connection immediately (non-blocking)
clientPromise
  .then((connectedClient) => {
    globalForMongo._mongoClient = connectedClient
    console.log("MongoDB connected successfully (db.ts)")
  })
  .catch((error) => {
    console.error("MongoDB connection error (db.ts):", error)
  })

export async function getDatabase(): Promise<Db> {
  try {
    // Ensure client is connected
    const connectedClient = await clientPromise
    // Check if client is still connected, reconnect if needed
    if (!connectedClient.topology?.isConnected()) {
      console.warn("MongoDB client disconnected, reconnecting...")
      await connectedClient.connect()
    }
    return connectedClient.db(databaseName)
  } catch (error) {
    console.error("Error getting database connection:", error)
    // Try to reconnect
    try {
      await client.close()
      const newClient = new MongoClient(connectionString, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
      })
      clientPromise = newClient.connect()
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
    const connectedClient = await clientPromise
    await connectedClient.close()
  } catch (error) {
    console.error("Error closing database connection:", error)
  }
}

