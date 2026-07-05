"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Copy,
  Download,
  ImageIcon,
  Linkedin,
  Loader2,
  Palette,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { UploadButton } from "@uploadthing/react"

type PostRow = {
  id: string
  platform: string
  templateId: string
  status: string
  caption: string
  assetUrl?: string
  renderError?: string
  fields: Record<string, string | undefined>
  updatedAt: string
}

type BrandKit = {
  companyName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: "border-slate-500/40 text-slate-700 dark:text-slate-300",
  rendered: "border-green-500/40 text-green-700 dark:text-green-300",
  ready: "border-primary/40 text-primary",
  pending_approval: "border-amber-500/40 text-amber-700 dark:text-amber-300",
  published: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  failed: "border-red-500/40 text-red-700 dark:text-red-300",
}

type LinkedInStatus = {
  connected: boolean
  displayName?: string
  linkedInConfigured?: boolean
}

export function SocialPostsView() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [brand, setBrand] = useState<BrandKit | null>(null)
  const [pexelsConfigured, setPexelsConfigured] = useState(false)
  const [linkedIn, setLinkedIn] = useState<LinkedInStatus>({ connected: false })
  const [linkedInConfigured, setLinkedInConfigured] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingBrand, setSavingBrand] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [renderingId, setRenderingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = posts.find((p) => p.id === selectedId) ?? posts[0] ?? null

  const previewAspectClass =
    selected?.platform === "instagram_story"
      ? "aspect-[9/16]"
      : selected?.platform === "instagram"
        ? "aspect-square"
        : "aspect-video"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [postsRes, brandRes, linkedInRes] = await Promise.all([
        fetch("/api/social/posts"),
        fetch("/api/social/brand-kit"),
        fetch("/api/social/linkedin/status"),
      ])
      const postsData = await postsRes.json()
      const brandData = await brandRes.json()
      const linkedInData = await linkedInRes.json()

      if (postsRes.ok) {
        setPosts(postsData.posts ?? [])
        if (!selectedId && postsData.posts?.[0]?.id) {
          setSelectedId(postsData.posts[0].id)
        }
      }
      if (brandRes.ok) {
        setBrand(brandData.brand)
        setPexelsConfigured(Boolean(brandData.pexelsConfigured))
      }
      if (linkedInRes.ok) {
        setLinkedIn(linkedInData.linkedin ?? { connected: false })
        setLinkedInConfigured(Boolean(linkedInData.linkedInConfigured))
      }
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (searchParams.get("connected") === "linkedin") {
      setBanner("LinkedIn connected successfully.")
    } else if (searchParams.get("error")) {
      setBanner(`Connection issue: ${searchParams.get("error")}`)
    }
  }, [searchParams])

  const publishPost = async (postId: string) => {
    setPublishingId(postId)
    try {
      const res = await fetch(`/api/social/posts/${postId}/publish`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setBanner("Published to LinkedIn.")
        await load()
      } else {
        alert(data.error ?? "Publish failed")
      }
    } finally {
      setPublishingId(null)
    }
  }

  const disconnectLinkedIn = async () => {
    await fetch("/api/social/linkedin/status", { method: "DELETE" })
    await load()
    setBanner("LinkedIn disconnected.")
  }

  const persistBrand = async (payload: BrandKit) => {
    setSavingBrand(true)
    try {
      const res = await fetch("/api/social/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) setBrand(data.brand)
    } finally {
      setSavingBrand(false)
    }
  }

  const saveBrand = async () => {
    if (!brand) return
    await persistBrand(brand)
  }

  const handleLogoUploadComplete = (res: { url: string }[]) => {
    if (!res[0]?.url || !brand) return
    setLogoUploading(false)
    const next = { ...brand, logoUrl: res[0].url }
    setBrand(next)
    void persistBrand(next)
    setBanner("Logo uploaded and saved to your brand kit.")
  }

  const handleLogoUploadError = (error: Error) => {
    console.error("Logo upload error:", error)
    setLogoUploading(false)
    alert("Failed to upload logo. Please try again.")
  }

  const removeLogo = () => {
    if (!brand) return
    const next = { ...brand, logoUrl: undefined }
    setBrand(next)
    void persistBrand(next)
  }

  const renderPost = async (postId: string) => {
    setRenderingId(postId)
    try {
      const res = await fetch(`/api/social/posts/${postId}/render`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        await load()
        setSelectedId(postId)
      } else {
        alert(data.error ?? "Render failed")
      }
    } finally {
      setRenderingId(null)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post draft?")) return
    const res = await fetch(`/api/social/posts/${postId}`, { method: "DELETE" })
    if (res.ok) {
      if (selectedId === postId) setSelectedId(null)
      await load()
    }
  }

  const copyCaption = async (caption: string) => {
    await navigator.clipboard.writeText(caption)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social content"
        description="Branded graphics generated by your AI Marketer — no Canva account required."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/founder/ai/ai-marketer/chat">
                <Sparkles className="mr-2 h-4 w-4" />
                Open AI Marketer
              </Link>
            </Button>
          </div>
        }
      />

      {banner ? (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">{banner}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkedIn.connected ? (
              <>
                <p className="text-sm">
                  Connected as <span className="font-medium">{linkedIn.displayName ?? "LinkedIn"}</span>
                </p>
                <Button size="sm" variant="outline" onClick={() => void disconnectLinkedIn()}>
                  Disconnect
                </Button>
              </>
            ) : linkedInConfigured ? (
              <Button size="sm" className="w-full" asChild>
                <a href="/api/social/linkedin/connect">
                  <Linkedin className="mr-2 h-4 w-4" />
                  Connect LinkedIn
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add <code className="rounded bg-muted px-1">LINKEDIN_CLIENT_ID</code> and{" "}
                <code className="rounded bg-muted px-1">LINKEDIN_CLIENT_SECRET</code> to enable
                publishing.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Brand kit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {brand ? (
              <>
                <div className="space-y-2">
                  <Label>Company name</Label>
                  <Input
                    value={brand.companyName}
                    onChange={(e) =>
                      setBrand((b) => (b ? { ...b, companyName: e.target.value } : b))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company logo</Label>
                  {brand.logoUrl ? (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brand.logoUrl}
                        alt="Company logo"
                        className="h-14 w-14 rounded-lg border object-contain bg-muted/30"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Logo uploaded</p>
                        <p className="text-xs text-muted-foreground">Used on rendered social graphics</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeLogo}
                        disabled={logoUploading || savingBrand}
                        title="Remove logo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                  <UploadButton<OurFileRouter, "companyLogo">
                    endpoint="companyLogo"
                    onClientUploadComplete={handleLogoUploadComplete}
                    onUploadError={handleLogoUploadError}
                    onUploadBegin={() => setLogoUploading(true)}
                    className="ut-button:w-full ut-button:bg-transparent ut-button:text-foreground ut-button:hover:bg-muted/50 ut-button:rounded-lg ut-button:border-2 ut-button:border-dashed ut-button:border-border"
                    content={{
                      button: ({ ready }) => (
                        <div className="flex w-full items-center justify-center gap-2 px-4 py-3">
                          {logoUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {!ready
                              ? "Preparing upload…"
                              : brand.logoUrl
                                ? "Replace logo"
                                : "Upload logo"}
                          </span>
                        </div>
                      ),
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs capitalize">{key.replace("Color", "")}</Label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={brand[key]}
                          onChange={(e) =>
                            setBrand((b) => (b ? { ...b, [key]: e.target.value } : b))
                          }
                          className="h-9 w-10 cursor-pointer rounded border"
                        />
                        <Input
                          value={brand[key]}
                          onChange={(e) =>
                            setBrand((b) => (b ? { ...b, [key]: e.target.value } : b))
                          }
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => void saveBrand()}
                  disabled={savingBrand || logoUploading}
                >
                  {savingBrand ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save brand kit
                </Button>
                {!pexelsConfigured ? (
                  <p className="text-xs text-muted-foreground">
                    Add <code className="rounded bg-muted px-1">PEXELS_API_KEY</code> for stock photo
                    backgrounds on editorial_photo and photo_launch templates.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading brand kit…</p>
            )}
          </CardContent>
        </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Post drafts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading…
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No social posts yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask the AI Marketer to create a LinkedIn or Instagram graphic. Drafts appear here
                  with rendered previews.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/founder/ai/ai-marketer/chat">Create with AI Marketer</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {posts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setSelectedId(post.id)}
                      className={cn(
                        "w-full rounded-lg border p-2 text-left transition-colors",
                        selected?.id === post.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex gap-3">
                        {post.assetUrl ? (
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.assetUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/20">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium capitalize">{post.platform}</span>
                            <Badge variant="outline" className={STATUS_COLORS[post.status] ?? ""}>
                              {post.status}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {post.caption}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {post.templateId.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selected ? (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium capitalize">{selected.platform}</p>
                        <p className="text-xs text-muted-foreground">
                          {selected.templateId.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => void copyCaption(selected.caption)}
                          title="Copy caption"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => void deletePost(selected.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {selected.assetUrl ? (
                      <div className="overflow-hidden rounded-lg border bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selected.assetUrl}
                          alt="Social post preview"
                          className="w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground",
                          previewAspectClass
                        )}
                      >
                        No image rendered yet
                      </div>
                    )}

                    {selected.renderError ? (
                      <p className="text-sm text-destructive">{selected.renderError}</p>
                    ) : null}

                    <div className="space-y-2">
                      <Label>Caption</Label>
                      <Textarea value={selected.caption} readOnly rows={5} className="text-sm" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => void renderPost(selected.id)}
                        disabled={renderingId === selected.id}
                      >
                        {renderingId === selected.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="mr-2 h-4 w-4" />
                        )}
                        {selected.assetUrl ? "Re-render" : "Render graphic"}
                      </Button>
                      {selected.assetUrl ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={selected.assetUrl} download target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download PNG
                          </a>
                        </Button>
                      ) : null}
                      {selected.platform === "linkedin" &&
                      selected.assetUrl &&
                      selected.status !== "published" &&
                      linkedIn.connected ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void publishPost(selected.id)}
                          disabled={publishingId === selected.id}
                        >
                          {publishingId === selected.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Publish to LinkedIn
                        </Button>
                      ) : null}
                      {selected.status === "pending_approval" ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/founder/ai/approvals">Review approval</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
