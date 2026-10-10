"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { FileText, ImagePlus, Link2, Loader2, MessageCircle, Send, Sparkles, Users } from "lucide-react"

import { LoungeAttachmentPreviews } from "@/components/lounge/lounge-attachments"
import { KPIStrip } from "@/components/kpi-card"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import { hostnameOf, kindFromFile, LOUNGE_MAX_ATTACHMENTS } from "@/lib/lounge/attachments"
import {
  LOUNGE_TOPIC_LABELS,
  LOUNGE_TOPICS,
  type LoungeAttachment,
  type LoungeAuthor,
  type LoungePost,
  type LoungeReply,
  type LoungeTopic,
} from "@/lib/lounge/types"
import { useUploadThing } from "@/lib/uploadthing-client"
import { cn } from "@/lib/utils"

type ApiPost = Omit<LoungePost, "createdAt" | "replies"> & {
  createdAt: string
  replies: Array<Omit<LoungeReply, "createdAt"> & { createdAt: string }>
}

type ApiMember = LoungeAuthor & { lastSeenAt: string }

const FILTERS: Array<{ id: "all" | LoungeTopic; label: string }> = [
  { id: "all", label: "All" },
  ...LOUNGE_TOPICS.map((id) => ({ id, label: LOUNGE_TOPIC_LABELS[id] })),
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  return name.slice(0, 1).toUpperCase() || "M"
}

function RoleBadge({ role }: { role: LoungeAuthor["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        role === "founder"
          ? "bg-[#c1ff72]/20 text-[#3f6b0d]"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
      )}
    >
      {role}
    </span>
  )
}

function AuthorChip({ author, time }: { author: LoungeAuthor; time?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar className="h-9 w-9">
        {author.image ? <AvatarImage src={author.image} alt="" /> : null}
        <AvatarFallback className="bg-neutral-100 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {initials(author.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-neutral-950 dark:text-white">{author.name}</p>
          <RoleBadge role={author.role} />
        </div>
        <p className="truncate text-[11px] text-neutral-500">
          {[author.company, time].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  )
}

export function InvestorLounge() {
  const { data: session } = authClient.useSession()
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [members, setMembers] = useState<ApiMember[]>([])
  const [topic, setTopic] = useState<"all" | LoungeTopic>("all")
  const [draft, setDraft] = useState("")
  const [draftTopic, setDraftTopic] = useState<LoungeTopic>("general")
  const [attachments, setAttachments] = useState<LoungeAttachment[]>([])
  const [linkDraft, setLinkDraft] = useState("")
  const [showLink, setShowLink] = useState(false)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("loungeMedia", {
    onClientUploadComplete: (files) => {
      setAttachments((prev) => {
        const next = [...prev]
        for (const file of files ?? []) {
          if (next.length >= LOUNGE_MAX_ATTACHMENTS) break
          if (next.some((item) => item.url === file.url)) continue
          next.push({
            id: crypto.randomUUID(),
            kind: kindFromFile({ name: file.name, type: file.type }),
            url: file.url,
            name: file.name,
            mimeType: file.type || undefined,
            sizeBytes: file.size,
          })
        }
        return next
      })
    },
    onUploadError: (uploadError) => {
      setError(uploadError.message || "Failed to upload. Try an image or PDF under 16MB.")
    },
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = topic === "all" ? "" : `?topic=${encodeURIComponent(topic)}`
      const res = await fetch(`/api/lounge/posts${query}`, { cache: "no-store" })
      const data = (await res.json()) as {
        posts?: ApiPost[]
        members?: ApiMember[]
        error?: string
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to load lounge")
      setPosts(data.posts ?? [])
      setMembers(data.members ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load lounge")
    } finally {
      setLoading(false)
    }
  }, [topic])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(() => {
    const founderCount = new Set(
      posts.filter((post) => post.author.role === "founder").map((post) => post.author.id),
    ).size
    const investorCount = new Set(
      posts.filter((post) => post.author.role === "investor").map((post) => post.author.id),
    ).size
    const replies = posts.reduce((sum, post) => sum + post.replyCount, 0)
    return [
      { title: "Posts", value: String(posts.length), icon: Sparkles },
      { title: "Founders", value: String(founderCount), icon: Users },
      { title: "Investors", value: String(investorCount), icon: Users },
      { title: "Replies", value: String(replies), icon: MessageCircle },
    ]
  }, [posts])

  const sessionRole = (session?.user as { role?: string } | undefined)?.role
  const me: LoungeAuthor = {
    id: session?.user.id ?? "",
    name: session?.user.name?.trim() || session?.user.email || "You",
    role: sessionRole === "investor" ? "investor" : "founder",
    image: session?.user.image ?? undefined,
  }

  const canAttach = attachments.length < LOUNGE_MAX_ATTACHMENTS && !isUploading && !posting

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return
    const remaining = LOUNGE_MAX_ATTACHMENTS - attachments.length
    void startUpload(Array.from(files).slice(0, remaining))
  }

  const addLink = () => {
    const url = linkDraft.trim()
    if (!/^https?:\/\//i.test(url)) {
      setError("Paste a full link starting with http:// or https://")
      return
    }
    if (attachments.some((item) => item.url === url)) {
      setLinkDraft("")
      setShowLink(false)
      return
    }
    if (attachments.length >= LOUNGE_MAX_ATTACHMENTS) return
    setAttachments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), kind: "link", url, name: hostnameOf(url) },
    ])
    setLinkDraft("")
    setShowLink(false)
    setError(null)
  }

  const publish = async () => {
    const body = draft.trim()
    if (!body && attachments.length === 0) return
    setPosting(true)
    setError(null)
    try {
      const res = await fetch("/api/lounge/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, topic: draftTopic, attachments }),
      })
      const data = (await res.json()) as { post?: ApiPost; error?: string }
      if (!res.ok || !data.post) throw new Error(data.error ?? "Failed to post")
      setDraft("")
      setAttachments([])
      setLinkDraft("")
      setShowLink(false)
      setPosts((prev) => [data.post!, ...prev])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post")
    } finally {
      setPosting(false)
    }
  }

  const replyTo = async (postId: string) => {
    const body = replyDrafts[postId]?.trim()
    if (!body) return
    setReplyingId(postId)
    setError(null)
    try {
      const res = await fetch(`/api/lounge/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      const data = (await res.json()) as { reply?: ApiPost["replies"][number]; error?: string }
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Failed to reply")
      setReplyDrafts((prev) => ({ ...prev, [postId]: "" }))
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                replyCount: post.replyCount + 1,
                replies: [...post.replies, data.reply!],
              }
            : post,
        ),
      )
      setOpenReplies((prev) => ({ ...prev, [postId]: true }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reply")
    } finally {
      setReplyingId(null)
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Lounge"
        description="A shared room for founders and investors — intros, raises, advice, and wins."
      />

      <KPIStrip items={stats} compact fullWidth />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#171717]">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                {me.image ? <AvatarImage src={me.image} alt="" /> : null}
                <AvatarFallback className="bg-neutral-100 text-[11px] font-semibold dark:bg-neutral-800">
                  {initials(me.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-3">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Share an intro, deck, demo link, or ask the room…"
                  rows={3}
                  className="min-h-[4.5rem] resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
                <LoungeAttachmentPreviews
                  attachments={attachments}
                  onRemove={(id) => setAttachments((prev) => prev.filter((item) => item.id !== id))}
                />
                {showLink ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={linkDraft}
                      onChange={(event) => setLinkDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          addLink()
                        }
                      }}
                      placeholder="https://…  deck, demo, Calendly, or site"
                      className="h-9"
                    />
                    <Button type="button" size="sm" className="h-9 rounded-full" onClick={addLink}>
                      Add
                    </Button>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {LOUNGE_TOPICS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDraftTopic(id)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                          draftTopic === id
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300",
                        )}
                      >
                        {LOUNGE_TOPIC_LABELS[id]}
                      </button>
                    ))}
                    <span className="mx-1 hidden h-4 w-px bg-neutral-200 sm:inline-block dark:bg-neutral-700" />
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-white"
                      disabled={!canAttach}
                      onClick={() => imageInputRef.current?.click()}
                      aria-label="Add image"
                      title="Add image"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-white"
                      disabled={!canAttach}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Add pitch deck or file"
                      title="Add pitch deck or file"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-white",
                        showLink && "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white",
                      )}
                      disabled={!canAttach}
                      onClick={() => setShowLink((open) => !open)}
                      aria-label="Add link"
                      title="Add link"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                    {isUploading ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading…
                      </span>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    className="h-8 rounded-full"
                    disabled={posting || isUploading || (draft.trim().length < 2 && attachments.length === 0)}
                    onClick={() => void publish()}
                  >
                    {posting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                    Post
                  </Button>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addFiles(event.target.files)
                    event.target.value = ""
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.key,.zip,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addFiles(event.target.files)
                    event.target.value = ""
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTopic(filter.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  topic === filter.id
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening the lounge…
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
              <Users className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-3 text-sm font-medium text-neutral-900 dark:text-white">
                The room is quiet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                Be the first to start a conversation. Founders and investors will see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const repliesOpen = openReplies[post.id] ?? post.replyCount > 0
                return (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#171717]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <AuthorChip
                        author={post.author}
                        time={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      />
                      <span className="shrink-0 rounded-full bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">
                        {LOUNGE_TOPIC_LABELS[post.topic]}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
                      {post.body}
                    </p>
                    {post.attachments?.length ? (
                      <div className="mt-3">
                        <LoungeAttachmentPreviews attachments={post.attachments} />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenReplies((prev) => ({ ...prev, [post.id]: !repliesOpen }))
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.replyCount === 0
                        ? "Reply"
                        : `${post.replyCount} ${post.replyCount === 1 ? "reply" : "replies"}`}
                    </button>

                    {repliesOpen ? (
                      <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="pl-1">
                            <AuthorChip
                              author={reply.author}
                              time={formatDistanceToNow(new Date(reply.createdAt), {
                                addSuffix: true,
                              })}
                            />
                            <p className="mt-2 pl-11 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                              {reply.body}
                            </p>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pl-11">
                          <input
                            value={replyDrafts[post.id] ?? ""}
                            onChange={(event) =>
                              setReplyDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault()
                                void replyTo(post.id)
                              }
                            }}
                            placeholder="Write a reply…"
                            className="h-9 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950"
                          />
                          <Button
                            type="button"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-full"
                            disabled={replyingId === post.id || !(replyDrafts[post.id] ?? "").trim()}
                            onClick={() => void replyTo(post.id)}
                            aria-label="Send reply"
                          >
                            {replyingId === post.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#171717]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              In the lounge
            </p>
            {members.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">
                Post once and you’ll appear here for founders and investors in the room.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {members.map((member) => (
                  <AuthorChip key={member.id} author={member} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#171717]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              House rules
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              <li>Founders and investors share the same room.</li>
              <li>Keep asks specific. Intros, raises, and advice belong here.</li>
              <li>No cold spam. Reply like you’d talk in person.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
