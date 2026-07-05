import { tool } from "ai"
import { z } from "zod"

import { writeAuditLog } from "@/lib/agents/services/audit"
import { getBrandKit, updateBrandKit } from "@/lib/social/brand-kit"
import { getSocialConnection } from "@/lib/social/connections-service"
import { isLinkedInConfigured } from "@/lib/social/linkedin/oauth"
import { isPexelsConfigured, searchBestPexelsPhoto } from "@/lib/social/pexels"
import {
  createSocialPost,
  findRecentDuplicatePost,
  getSocialPost,
  listSocialPosts,
  updateSocialPost,
} from "@/lib/social/posts-service"
import { renderSocialPostAsset } from "@/lib/social/render"
import { enrichPhotoLaunchFields } from "@/lib/social/render/photo-launch"
import { enrichEditorialFields } from "@/lib/social/render/editorial-photo"
import { enrichBrandingGraphicFields } from "@/lib/social/render/branding-graphic"
import { publishPostToLinkedIn } from "@/lib/social/publish-linkedin"
import { shouldBlockVagueSocialDraft } from "@/lib/social/marketer-chat-intent"
import {
  SOCIAL_PLATFORMS,
  SOCIAL_TEMPLATES,
  type SocialPost,
  type SocialTemplateFields,
} from "@/lib/social/types"
import { wrapToolWithPolicy } from "@/lib/agents/tools/wrap"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export type SocialToolName =
  | "get_social_brand_kit"
  | "update_social_brand_kit"
  | "get_social_connections"
  | "resolve_background_image"
  | "draft_social_post"
  | "render_social_asset"
  | "list_social_drafts"
  | "publish_social_post"

const SOCIAL_TOOL_DESCRIPTIONS: Record<SocialToolName, string> = {
  get_social_brand_kit:
    "Get workspace brand kit for social graphics: company name, uploaded logo, and brand colors.",
  update_social_brand_kit:
    "Update workspace brand colors or company name. Logo is uploaded by the user at /founder/social (not via URL).",
  get_social_connections:
    "Check whether LinkedIn (or other platforms) are connected for publishing.",
  resolve_background_image:
    "Search Pexels for a background image. Pass headline/caption/template context so results match the post (e.g. launch → celebration, not generic teamwork). Returns URL, alt, and the query used.",
  draft_social_post:
    "Create ONE social post draft and auto-render the branded PNG. Ask 1–3 clarifying questions if the user wants a design/flyer/graphic but platform or topic is unclear. Instagram: editorial_photo. LinkedIn: branding_graphic. After drafting, tell them to open /founder/social. Never create multiple drafts per request.",
  render_social_asset:
    "Re-render the branded PNG for an existing post (e.g. after editing fields). Usually not needed right after draft_social_post.",
  list_social_drafts:
    "List social post drafts and rendered assets for the workspace.",
  publish_social_post:
    "Publish a rendered LinkedIn post (requires human approval and LinkedIn connection).",
}

const SOCIAL_POLICIES: Record<SocialToolName, ToolPolicy> = {
  get_social_brand_kit: {
    id: "get_social_brand_kit",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  update_social_brand_kit: {
    id: "update_social_brand_kit",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  get_social_connections: {
    id: "get_social_connections",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  resolve_background_image: {
    id: "resolve_background_image",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  draft_social_post: {
    id: "draft_social_post",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  render_social_asset: {
    id: "render_social_asset",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  list_social_drafts: {
    id: "list_social_drafts",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  publish_social_post: {
    id: "publish_social_post",
    autonomyTier: "T2",
    sideEffect: "write",
    allowedAgents: [],
  },
}

async function auditSocialTool(
  ctx: ToolContext,
  toolId: SocialToolName,
  correlationId: string | undefined,
  extra?: Record<string, unknown>
) {
  await writeAuditLog({
    ownerId: ctx.userId,
    agentId: ctx.agentId,
    action: "tool.execute",
    correlationId,
    policyDecision: "allowed",
    resource: { type: "tool", id: toolId },
    metadata: { toolId, ...extra },
  })
}

const PHOTO_BG_TEMPLATES = new Set(["photo_launch", "editorial_photo"])

const GRAPHIC_TEMPLATES = new Set(["branding_graphic"])

function enrichDraftFields(
  templateId: string,
  caption: string,
  fields: SocialTemplateFields
) {
  if (templateId === "branding_graphic") {
    return enrichBrandingGraphicFields({ caption, fields })
  }
  if (templateId === "editorial_photo") {
    return enrichEditorialFields({ caption, fields })
  }
  if (templateId === "photo_launch") {
    return enrichPhotoLaunchFields({ caption, fields })
  }
  return fields
}

function defaultTemplateForPlatform(platform: string): (typeof SOCIAL_TEMPLATES)[number] {
  if (platform === "instagram" || platform === "instagram_story") {
    return "editorial_photo"
  }
  if (platform === "linkedin") {
    return "branding_graphic"
  }
  return "metric_announcement"
}

function summarizePost(post: SocialPost) {
  return {
    id: post.id,
    platform: post.platform,
    templateId: post.templateId,
    status: post.status,
    caption: post.caption.slice(0, 200),
    assetUrl: post.assetUrl,
    renderError: post.renderError,
    updatedAt: post.updatedAt.toISOString(),
  }
}

const fieldsSchema = z.object({
  headline: z.string().optional(),
  subhead: z.string().optional(),
  metric: z.string().optional(),
  metricLabel: z.string().optional(),
  quote: z.string().optional(),
  attribution: z.string().optional(),
  badge: z.string().optional(),
  footerCta: z
    .string()
    .optional()
    .describe('Footer line e.g. "Save this post · Follow for more" (editorial_photo)'),
  slideNumber: z
    .string()
    .optional()
    .describe('Carousel slide number e.g. "3" (branding_graphic)'),
  slideTotal: z
    .string()
    .optional()
    .describe('Carousel slide total e.g. "5" (branding_graphic)'),
  bgKeywords: z
    .string()
    .optional()
    .describe(
      "Optional Pexels hint (2–4 specific visual words). Avoid vague terms like 'startup' or 'team'. Example launch: 'product launch celebration spotlight'."
    ),
  bgImageUrl: z.string().optional(),
  screenshotUrl: z.string().optional(),
})

export function getSocialToolPolicy(
  toolId: SocialToolName,
  allowedAgents: string[]
): ToolPolicy {
  return { ...SOCIAL_POLICIES[toolId], allowedAgents }
}

export function createSocialTools(ctx: ToolContext, correlationId?: string) {
  const platformSchema = z.enum(SOCIAL_PLATFORMS)
  const templateSchema = z.enum(SOCIAL_TEMPLATES)

  return {
    get_social_brand_kit: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.get_social_brand_kit,
      inputSchema: z.object({}),
      execute: async () => {
        const brand = await getBrandKit(ctx.userId)
        await auditSocialTool(ctx, "get_social_brand_kit", correlationId)
        return {
          companyName: brand.companyName,
          logoUrl: brand.logoUrl,
          primaryColor: brand.primaryColor,
          secondaryColor: brand.secondaryColor,
          accentColor: brand.accentColor,
          pexelsConfigured: isPexelsConfigured(),
          linkedInConfigured: isLinkedInConfigured(),
        }
      },
    }),

    get_social_connections: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.get_social_connections,
      inputSchema: z.object({}),
      execute: async () => {
        const linkedin = await getSocialConnection(ctx.userId, "linkedin")
        await auditSocialTool(ctx, "get_social_connections", correlationId)
        return {
          linkedin: linkedin
            ? {
                connected: true,
                displayName: linkedin.displayName,
                expiresAt: linkedin.expiresAt.toISOString(),
              }
            : { connected: false },
          connectPath: "/founder/social",
        }
      },
    }),

    update_social_brand_kit: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.update_social_brand_kit,
      inputSchema: z.object({
        companyName: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
      }),
      execute: async (input) => {
        const brand = await updateBrandKit(ctx.userId, input)
        await auditSocialTool(ctx, "update_social_brand_kit", correlationId)
        return { success: true, brand }
      },
    }),

    resolve_background_image: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.resolve_background_image,
      inputSchema: z.object({
        keywords: z.string().min(2).optional(),
        headline: z.string().optional(),
        subhead: z.string().optional(),
        badge: z.string().optional(),
        caption: z.string().optional(),
        templateId: templateSchema.optional(),
      }),
      execute: async (input) => {
        if (!isPexelsConfigured()) {
          return {
            found: false,
            hint: "PEXELS_API_KEY is not configured. Use gradient templates or provide bgImageUrl.",
          }
        }

        const photo = await searchBestPexelsPhoto(input)
        await auditSocialTool(ctx, "resolve_background_image", correlationId, {
          keywords: input.keywords,
          headline: input.headline,
          found: Boolean(photo),
          query: photo?.query,
          score: photo?.score,
        })

        if (!photo) {
          return { found: false, input }
        }

        return {
          found: true,
          url: photo.url,
          alt: photo.alt,
          query: photo.query,
          relevanceScore: photo.score,
          attribution: `Photo by ${photo.photographer} on Pexels`,
          photographerUrl: photo.photographerUrl,
          tip: "Set fields.bgImageUrl to this URL, or set fields.bgKeywords to the query string before render.",
        }
      },
    }),

    draft_social_post: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.draft_social_post,
      inputSchema: z.object({
        platform: platformSchema,
        templateId: templateSchema.optional(),
        caption: z.string().min(1),
        userRequest: z
          .string()
          .optional()
          .describe("The user's exact latest message — used to block vague requests"),
        fields: fieldsSchema,
      }),
      execute: async ({ platform, templateId, caption, userRequest, fields }) => {
        const clarification = shouldBlockVagueSocialDraft({
          caption,
          userRequest,
          headline: fields.headline,
        })
        if (clarification.block) {
          return {
            needsClarification: true,
            blocked: true,
            reason: clarification.reason,
            questions: clarification.questions,
            message:
              "Draft blocked — the request is too vague. Ask the user the questions listed in questions[]. Do NOT call draft_social_post again until they provide platform and topic.",
          }
        }

        let resolvedTemplateId = templateId ?? defaultTemplateForPlatform(platform)

        const duplicate = await findRecentDuplicatePost(ctx.userId, {
          platform,
          templateId: resolvedTemplateId,
          caption,
          correlationId,
        })
        if (duplicate) {
          const needsRender =
            !duplicate.assetUrl ||
            (PHOTO_BG_TEMPLATES.has(duplicate.templateId) &&
              !duplicate.fields.bgImageUrl)

          if (needsRender) {
            try {
              const result = await renderSocialPostAsset({
                ownerId: ctx.userId,
                postId: duplicate.id,
              })
              const updated = await getSocialPost(duplicate.id, ctx.userId)
              return {
                post: summarizePost(updated ?? duplicate),
                rendered: true,
                assetUrl: result.assetUrl,
                deduplicated: true,
                reviewPath: "/founder/social",
              }
            } catch {
              // fall through to return duplicate as-is
            }
          }
          return {
            post: summarizePost(duplicate),
            rendered: Boolean(duplicate.assetUrl),
            assetUrl: duplicate.assetUrl,
            deduplicated: true,
            reviewPath: "/founder/social",
          }
        }

        let resolvedFields = { ...fields }

        if (
          resolvedTemplateId === "feature_highlight" &&
          !resolvedFields.screenshotUrl &&
          (platform === "instagram" || platform === "instagram_story")
        ) {
          resolvedTemplateId = "editorial_photo"
        }

        if (
          PHOTO_BG_TEMPLATES.has(resolvedTemplateId) &&
          !resolvedFields.bgImageUrl &&
          isPexelsConfigured()
        ) {
          const enriched = enrichDraftFields(
            resolvedTemplateId,
            caption,
            resolvedFields
          )
          const photo = await searchBestPexelsPhoto({
            keywords: enriched.bgKeywords,
            headline: enriched.headline,
            subhead: enriched.subhead,
            badge: enriched.badge,
            caption,
            templateId: resolvedTemplateId,
            platform,
          })
          if (photo) {
            resolvedFields = {
              ...enriched,
              bgImageUrl: photo.url,
              bgKeywords: photo.query,
            }
          } else {
            resolvedFields = enriched
          }
        } else if (
          PHOTO_BG_TEMPLATES.has(resolvedTemplateId) ||
          GRAPHIC_TEMPLATES.has(resolvedTemplateId)
        ) {
          resolvedFields = enrichDraftFields(
            resolvedTemplateId,
            caption,
            resolvedFields
          )
        }

        const post = await createSocialPost(ctx.userId, {
          platform,
          templateId: resolvedTemplateId,
          caption,
          fields: resolvedFields,
          agentId: ctx.agentId,
          correlationId,
          status: "draft",
        })

        await auditSocialTool(ctx, "draft_social_post", correlationId, {
          postId: post.id,
          platform,
          templateId: resolvedTemplateId,
          autoPexels: Boolean(resolvedFields.bgImageUrl && !fields.bgImageUrl),
        })

        try {
          const result = await renderSocialPostAsset({
            ownerId: ctx.userId,
            postId: post.id,
          })
          const updated = await getSocialPost(post.id, ctx.userId)

          await auditSocialTool(ctx, "render_social_asset", correlationId, {
            postId: post.id,
            assetUrl: result.assetUrl,
            auto: true,
          })

          return {
            post: summarizePost(updated ?? post),
            rendered: true,
            assetUrl: result.assetUrl,
            width: result.width,
            height: result.height,
            reviewPath: "/founder/social",
            userMessage:
              "Graphic rendered. Tell the user to preview and download at /founder/social.",
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Render failed"
          await updateSocialPost(post.id, ctx.userId, {
            renderError: message,
          })

          return {
            post: summarizePost(
              (await getSocialPost(post.id, ctx.userId)) ?? post
            ),
            rendered: false,
            renderError: message,
            reviewPath: "/founder/social",
            nextStep: "Fix template fields or call render_social_asset to retry.",
          }
        }
      },
    }),

    render_social_asset: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.render_social_asset,
      inputSchema: z.object({
        postId: z.string().min(1),
      }),
      execute: async ({ postId }) => {
        const existing = await getSocialPost(postId, ctx.userId)
        if (!existing) {
          return { error: "Social post not found" }
        }

        try {
          const result = await renderSocialPostAsset({
            ownerId: ctx.userId,
            postId,
          })

          await auditSocialTool(ctx, "render_social_asset", correlationId, {
            postId,
            assetUrl: result.assetUrl,
          })

          return {
            success: true,
            postId,
            assetUrl: result.assetUrl,
            width: result.width,
            height: result.height,
            reviewPath: "/founder/social",
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Render failed"
          await auditSocialTool(ctx, "render_social_asset", correlationId, {
            postId,
            error: message,
          })
          return { error: message, postId }
        }
      },
    }),

    list_social_drafts: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.list_social_drafts,
      inputSchema: z.object({
        status: z
          .enum(["draft", "rendered", "ready", "pending_approval", "published", "failed"])
          .optional(),
        limit: z.union([z.string(), z.number()]).optional(),
      }),
      execute: async ({ status, limit }) => {
        const parsedLimit =
          limit === undefined || limit === ""
            ? 20
            : Math.min(30, Math.max(1, parseInt(String(limit), 10) || 20))

        const posts = await listSocialPosts(ctx.userId, {
          status,
          limit: parsedLimit,
        })

        await auditSocialTool(ctx, "list_social_drafts", correlationId, {
          count: posts.length,
        })

        return { posts: posts.map(summarizePost) }
      },
    }),

    publish_social_post: tool({
      description: SOCIAL_TOOL_DESCRIPTIONS.publish_social_post,
      inputSchema: z.object({
        postId: z.string().min(1),
      }),
      execute: async ({ postId }) => {
        const post = await getSocialPost(postId, ctx.userId)
        if (!post) {
          return { error: "Social post not found" }
        }

        if (post.platform !== "linkedin") {
          return {
            error: "Only LinkedIn publishing is supported. Download the asset for other platforms.",
          }
        }

        if (!post.assetUrl) {
          return { error: "Render the graphic first with render_social_asset." }
        }

        try {
          const result = await publishPostToLinkedIn({
            ownerId: ctx.userId,
            postId,
            agentId: ctx.agentId,
            correlationId,
          })

          await auditSocialTool(ctx, "publish_social_post", correlationId, {
            postId,
            externalId: result.externalId,
          })

          return {
            success: true,
            postId,
            externalId: result.externalId,
            reviewPath: "/founder/social",
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Publish failed"
          await updateSocialPost(postId, ctx.userId, {
            status: "failed",
            publishError: message,
          })
          return { error: message, postId }
        }
      },
    }),
  }
}

export function wrapSocialToolsForAgent(
  ctx: ToolContext,
  toolIds: SocialToolName[],
  correlationId?: string
) {
  const all = createSocialTools(ctx, correlationId)
  const wrapped: Partial<ReturnType<typeof createSocialTools>> = {}

  for (const id of toolIds) {
    const policy = getSocialToolPolicy(id, [ctx.agentId])
    wrapped[id] = wrapToolWithPolicy(all[id], policy, ctx, correlationId)
  }

  return wrapped
}
