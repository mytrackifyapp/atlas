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

// Global client instance to reuse across requests (Next.js / Vercel serverless safe pattern)
const globalForMongo = globalThis as unknown as {
  _betterAuthMongoClient?: MongoClient
}

const client = globalForMongo._betterAuthMongoClient ?? createClient()
globalForMongo._betterAuthMongoClient = client

// Better Auth adapter only needs a Db object; the client is cached above.
const db = client.db(databaseName)

/**
 * Allow both apex and www when `BETTER_AUTH_URL` only lists one — otherwise
 * sign-in from the other host gets 403 "Invalid origin".
 * Merge with optional `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated).
 */
function alternatePublicOrigins(): string[] {
  const fromEnv =
    process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean) ?? []
  const primary = (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    ""
  )
    .trim()
    .replace(/\/$/, "")

  const extra = new Set<string>()
  for (const e of fromEnv) {
    try {
      extra.add(new URL(e).origin)
    } catch {
      extra.add(e)
    }
  }

  if (!primary || primary.includes("localhost")) {
    return [...extra]
  }

  try {
    const u = new URL(primary)
    const alt = u.hostname.startsWith("www.")
      ? `${u.protocol}//${u.hostname.slice(4)}`
      : `${u.protocol}//www.${u.hostname}`
    if (alt !== u.origin) {
      extra.add(alt)
    }
  } catch {
    /* ignore */
  }

  return [...extra]
}

export const auth = betterAuth({
  ...(alternatePublicOrigins().length
    ? { trustedOrigins: alternatePublicOrigins() }
    : {}),
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

