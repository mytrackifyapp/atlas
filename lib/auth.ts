import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"

// MongoDB connection
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
// Note: mongodb+srv:// automatically uses TLS, so we don't need to set it explicitly
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
      // Don't throw here, let Better Auth handle it
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
clientPromise.then((connectedClient) => {
  globalForMongo._mongoClient = connectedClient
  console.log("MongoDB connected successfully")
}).catch((error) => {
  console.error("MongoDB connection error:", error)
})

// Get database instance - Better Auth will handle connection when needed
const db = client.db(databaseName)

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
    sendResetPassword: async ({ user, url, token }, request) => {
      // TODO: Integrate with your email service (Resend, SendGrid, etc.)
      // For now, we'll log the reset link. In production, send an email.
      console.log("Password reset requested for:", user.email)
      console.log("Reset URL:", url)
      console.log("Reset token:", token)
      
      // Example with a real email service:
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   html: `
      //     <h2>Reset Your Password</h2>
      //     <p>Click the link below to reset your password:</p>
      //     <a href="${url}">Reset Password</a>
      //     <p>This link will expire in 1 hour.</p>
      //   `,
      // })
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password reset successful for user: ${user.email}`)
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false, // Don't allow user to set role during signup
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
})

