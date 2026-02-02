import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getSessionWithRole } from "@/lib/auth-helpers"

const f = createUploadthing()

export const ourFileRouter = {
  companyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Authenticate user
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete")
      console.log("file url", file.url)
      return { url: file.url }
    }),

  pitchDeck: f({ 
    file: { 
      maxFileSize: "10MB", 
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      // Authenticate user
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Pitch deck upload complete for userId:", metadata?.userId)
      console.log("file url", file.url)
      return { uploadedBy: metadata?.userId, url: file.url }
    }),

  financialModel: f({ 
    file: { 
      maxFileSize: "10MB", 
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      // Authenticate user
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Financial model upload complete for userId:", metadata?.userId)
      console.log("file url", file.url)
      return { uploadedBy: metadata?.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
