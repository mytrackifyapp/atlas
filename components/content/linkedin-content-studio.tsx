"use client"

import { useState } from "react"
import { toast } from "sonner"

import { LinkedInPostArt } from "@/components/content/linkedin-post-art"
import { downloadLinkedInPng } from "@/lib/content/download-linkedin-png"
import {
  LINKEDIN_POST_SIZE,
  postsForAudience,
  type LinkedInAudience,
  type LinkedInStudioPost,
} from "@/lib/content/linkedin-posts"
import { cn } from "@/lib/utils"

export function LinkedInContentStudio() {
  const [audience, setAudience] = useState<LinkedInAudience>("personal")
  const posts = postsForAudience(audience)

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#171717]">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
          Private · Content studio
        </p>
        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              LinkedIn posts
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
              Personal brand and Trackify company page. Preview, download PNGs,
              copy captions.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <AudienceLink
              active={audience === "personal"}
              onClick={() => setAudience("personal")}
            >
              Personal
            </AudienceLink>
            <AudienceLink
              active={audience === "company"}
              onClick={() => setAudience("company")}
            >
              Company
            </AudienceLink>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AudienceLink({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm transition-colors",
        active
          ? "font-medium text-[#171717] underline decoration-neutral-300 underline-offset-4"
          : "text-neutral-400 hover:text-neutral-600"
      )}
    >
      {children}
    </button>
  )
}

function PostCard({ post }: { post: LinkedInStudioPost }) {
  const [downloading, setDownloading] = useState(false)

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption)
      toast.success("Caption copied")
    } catch {
      toast.error("Could not copy caption")
    }
  }

  const download = async () => {
    setDownloading(true)
    try {
      await downloadLinkedInPng(post)
    } catch {
      toast.error("Could not download PNG")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <article className="rounded-[22px] border border-black/[0.06] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-4">
      <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-neutral-400">
        <span>{post.category}</span>
        <span>
          LinkedIn · {LINKEDIN_POST_SIZE} × {LINKEDIN_POST_SIZE}
        </span>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-black/[0.04]">
        <LinkedInPostArt post={post} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void download()}
          disabled={downloading}
          className="rounded-full bg-[#171717] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {downloading ? "Downloading…" : "Download PNG"}
        </button>
        <button
          type="button"
          onClick={() => void copyCaption()}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#171717] hover:bg-neutral-50"
        >
          Copy caption
        </button>
      </div>

      <div className="mt-4 rounded-[16px] border border-black/[0.06] px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
          Caption
        </p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
          {post.caption}
        </p>
      </div>
    </article>
  )
}
