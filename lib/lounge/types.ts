export const LOUNGE_TOPICS = ["general", "intro", "raise", "advice", "win"] as const

export type LoungeTopic = (typeof LOUNGE_TOPICS)[number]

export type LoungeRole = "founder" | "investor"

export type LoungeAttachmentKind = "image" | "file" | "link"

export type LoungeAttachment = {
  id: string
  kind: LoungeAttachmentKind
  url: string
  name: string
  mimeType?: string
  sizeBytes?: number
}

export type LoungeAuthor = {
  id: string
  name: string
  role: LoungeRole
  image?: string
  company?: string
}

export type LoungeReply = {
  id: string
  postId: string
  author: LoungeAuthor
  body: string
  createdAt: Date
}

export type LoungePost = {
  id: string
  author: LoungeAuthor
  topic: LoungeTopic
  body: string
  attachments: LoungeAttachment[]
  replyCount: number
  replies: LoungeReply[]
  createdAt: Date
}

export type LoungeMember = LoungeAuthor & {
  lastSeenAt: Date
}

export const LOUNGE_TOPIC_LABELS: Record<LoungeTopic, string> = {
  general: "Lounge",
  intro: "Intros",
  raise: "Raises",
  advice: "Advice",
  win: "Wins",
}
