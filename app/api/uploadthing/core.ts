import { createUploadthing, type FileRouter } from "uploadthing/next"
import { z } from "zod"

import { indexDocumentForAgents } from "@/lib/documents/index-for-agents"
import { createDocumentFromUpload } from "@/lib/documents/service"
import { DOCUMENT_CATEGORIES } from "@/lib/documents/types"
import { indexAgentSetupFile } from "@/lib/agents/foundation-file-index"
import { getSessionWithRole } from "@/lib/auth-helpers"

const f = createUploadthing()

const dataRoomInput = z.object({
  category: z.enum(DOCUMENT_CATEGORIES),
  shared: z.boolean().optional(),
  name: z.string().optional(),
})

const agentSetupFileInput = z.object({
  agentId: z.string().min(1),
})

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
      return { url: file.url }
    }),

  pitchDeck: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata?.userId, url: file.url }
    }),

  financialModel: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata?.userId, url: file.url }
    }),

  dataRoomDocument: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    text: { maxFileSize: "4MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .input(dataRoomInput)
    .middleware(async ({ input }) => {
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }

      return {
        userId: session.user.id,
        userName: session.user.name ?? session.user.email,
        userEmail: session.user.email,
        category: input.category,
        shared: input.shared ?? false,
        customName: input.name?.trim() || undefined,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const document = await createDocumentFromUpload({
        ownerId: metadata.userId,
        name: metadata.customName || file.name,
        category: metadata.category,
        url: file.url,
        mimeType: file.type || undefined,
        sizeBytes: file.size,
        shared: metadata.shared,
        uploadedByName: metadata.userName,
        uploadedByEmail: metadata.userEmail,
      })

      const indexed = await indexDocumentForAgents(document)

      return {
        documentId: indexed.id,
        indexStatus: indexed.indexStatus,
      }
    }),

  agentSetupFile: f({
    pdf: { maxFileSize: "10MB", maxFileCount: 1 },
    text: { maxFileSize: "4MB", maxFileCount: 1 },
    blob: { maxFileSize: "10MB", maxFileCount: 1 },
  })
    .input(agentSetupFileInput)
    .middleware(async ({ input }) => {
      const session = await getSessionWithRole()
      if (!session) {
        throw new Error("Unauthorized")
      }

      return {
        userId: session.user.id,
        agentId: input.agentId,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await indexAgentSetupFile({
        ownerId: metadata.userId,
        agentId: metadata.agentId,
        fileName: file.name,
        url: file.url,
        mimeType: file.type || undefined,
        fileKey: file.key,
      })

      return {
        url: file.url,
        name: file.name,
        mimeType: file.type || undefined,
        sizeBytes: file.size,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
