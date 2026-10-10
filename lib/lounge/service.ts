import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { LoungeRole } from "@/lib/lounge/types"
import {
  LOUNGE_TOPICS,
  type LoungeAttachment,
  type LoungeAuthor,
  type LoungeMember,
  type LoungePost,
  type LoungeReply,
  type LoungeTopic,
} from "@/lib/lounge/types"
import { sanitizeAttachments } from "@/lib/lounge/attachments"

const POSTS = "lounge_posts"
const REPLIES = "lounge_replies"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await Promise.all([
    db.collection(POSTS).createIndex({ createdAt: -1 }),
    db.collection(POSTS).createIndex({ topic: 1, createdAt: -1 }),
    db.collection(REPLIES).createIndex({ postId: 1, createdAt: 1 }),
  ])
  indexesEnsured = true
}

function asAuthor(row: {
  authorId?: string
  authorName?: string
  authorRole?: string
  authorImage?: string
  authorCompany?: string
}): LoungeAuthor {
  return {
    id: String(row.authorId ?? ""),
    name: String(row.authorName ?? "Member").trim() || "Member",
    role: row.authorRole === "investor" ? "investor" : "founder",
    image: typeof row.authorImage === "string" ? row.authorImage : undefined,
    company: typeof row.authorCompany === "string" ? row.authorCompany : undefined,
  }
}

function asReply(row: {
  _id: ObjectId
  postId?: string
  body?: string
  createdAt?: Date
  authorId?: string
  authorName?: string
  authorRole?: string
  authorImage?: string
  authorCompany?: string
}): LoungeReply {
  return {
    id: row._id.toString(),
    postId: String(row.postId ?? ""),
    author: asAuthor(row),
    body: String(row.body ?? "").trim(),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(),
  }
}

function asPost(
  row: {
    _id: ObjectId
    topic?: string
    body?: string
    attachments?: unknown
    createdAt?: Date
    authorId?: string
    authorName?: string
    authorRole?: string
    authorImage?: string
    authorCompany?: string
  },
  replies: LoungeReply[],
): LoungePost {
  const topic = LOUNGE_TOPICS.includes(row.topic as LoungeTopic)
    ? (row.topic as LoungeTopic)
    : "general"
  return {
    id: row._id.toString(),
    author: asAuthor(row),
    topic,
    body: String(row.body ?? "").trim(),
    attachments: sanitizeAttachments(row.attachments),
    replyCount: replies.length,
    replies,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(),
  }
}

export async function resolveLoungeAuthor(input: {
  userId: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}): Promise<LoungeAuthor> {
  const db = await getDatabase()
  let company: string | undefined

  const fundraise = await db.collection("fundraises").findOne({ userId: input.userId })
  if (fundraise?.companyName && typeof fundraise.companyName === "string") {
    company = fundraise.companyName.trim() || undefined
  }

  if (!company) {
    try {
      if (ObjectId.isValid(input.userId)) {
        const user = await db.collection("user").findOne({ _id: new ObjectId(input.userId) })
        if (user?.companyName && typeof user.companyName === "string") {
          company = user.companyName.trim() || undefined
        }
      }
    } catch {
      // keep name-only author
    }
  }

  const role: LoungeRole = input.role === "investor" ? "investor" : "founder"
  const name =
    input.name?.trim() ||
    input.email?.split("@")[0]?.replace(/[._]/g, " ") ||
    "Member"

  return {
    id: input.userId,
    name,
    role,
    image: input.image ?? undefined,
    company,
  }
}

export async function listLoungePosts(topic?: LoungeTopic): Promise<LoungePost[]> {
  await ensureIndexes()
  const db = await getDatabase()
  const filter = topic ? { topic } : {}
  const rows = await db.collection(POSTS).find(filter).sort({ createdAt: -1 }).limit(80).toArray()
  const ids = rows.map((row) => row._id.toString())
  const replyRows = ids.length
    ? await db
        .collection(REPLIES)
        .find({ postId: { $in: ids } })
        .sort({ createdAt: 1 })
        .toArray()
    : []

  const byPost = new Map<string, LoungeReply[]>()
  for (const row of replyRows) {
    const reply = asReply(row as Parameters<typeof asReply>[0])
    const list = byPost.get(reply.postId) ?? []
    list.push(reply)
    byPost.set(reply.postId, list)
  }

  return rows.map((row) =>
    asPost(row as Parameters<typeof asPost>[0], byPost.get(row._id.toString()) ?? []),
  )
}

export async function listLoungeMembers(): Promise<LoungeMember[]> {
  await ensureIndexes()
  const db = await getDatabase()
  const rows = await db.collection(POSTS).find({}).sort({ createdAt: -1 }).limit(40).toArray()
  const seen = new Set<string>()
  const members: LoungeMember[] = []

  for (const row of rows) {
    const author = asAuthor(row as Parameters<typeof asAuthor>[0])
    if (!author.id || seen.has(author.id)) continue
    seen.add(author.id)
    members.push({
      ...author,
      lastSeenAt: row.createdAt instanceof Date ? row.createdAt : new Date(),
    })
    if (members.length >= 12) break
  }

  return members
}

export async function createLoungePost(input: {
  author: LoungeAuthor
  body: string
  topic: LoungeTopic
  attachments?: LoungeAttachment[]
}): Promise<LoungePost> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const attachments = sanitizeAttachments(input.attachments)
  const doc = {
    authorId: input.author.id,
    authorName: input.author.name,
    authorRole: input.author.role,
    authorImage: input.author.image,
    authorCompany: input.author.company,
    topic: input.topic,
    body: input.body.trim(),
    attachments,
    createdAt: now,
    updatedAt: now,
  }
  const result = await db.collection(POSTS).insertOne(doc)
  return asPost({ _id: result.insertedId, ...doc }, [])
}

export async function createLoungeReply(input: {
  postId: string
  author: LoungeAuthor
  body: string
}): Promise<LoungeReply> {
  await ensureIndexes()
  const db = await getDatabase()
  if (!ObjectId.isValid(input.postId)) {
    throw new Error("Post not found")
  }
  const post = await db.collection(POSTS).findOne({ _id: new ObjectId(input.postId) })
  if (!post) throw new Error("Post not found")

  const now = new Date()
  const doc = {
    postId: input.postId,
    authorId: input.author.id,
    authorName: input.author.name,
    authorRole: input.author.role,
    authorImage: input.author.image,
    authorCompany: input.author.company,
    body: input.body.trim(),
    createdAt: now,
  }
  const result = await db.collection(REPLIES).insertOne(doc)
  return asReply({ _id: result.insertedId, ...doc })
}
