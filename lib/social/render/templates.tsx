import type { ReactNode } from "react"

import type { SocialBrandKit, SocialTemplateFields } from "@/lib/social/types"

export type TemplateRenderContext = {
  brand: SocialBrandKit
  fields: SocialTemplateFields
  width: number
  height: number
  logoDataUri?: string | null
  fontScale?: {
    headline: number
    subhead: number
    brand: number
    logo: number
    badge: number
    padding: number
  }
}

function brandRow(
  brand: SocialBrandKit,
  logoDataUri: string | null | undefined,
  size = 56,
  fontSize = 22
): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {logoDataUri ? (
        <img
          src={logoDataUri}
          width={size}
          height={size}
          style={{ objectFit: "contain", borderRadius: 12 }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          fontSize,
          fontWeight: 700,
          opacity: 0.95,
        }}
      >
        {brand.companyName}
      </div>
    </div>
  )
}

export function metricAnnouncementTemplate(ctx: TemplateRenderContext): ReactNode {
  const { brand, fields, width, height, logoDataUri } = ctx

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%)`,
        padding: 64,
        fontFamily: "Inter",
        color: "#ffffff",
      }}
    >
      {brandRow(brand, logoDataUri)}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: 16,
        }}
      >
        {fields.badge ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: brand.accentColor,
              color: brand.primaryColor,
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {fields.badge}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {fields.headline ?? "Milestone reached"}
        </div>
        {fields.metric ? (
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              color: brand.accentColor,
              lineHeight: 1,
            }}
          >
            {fields.metric}
          </div>
        ) : null}
        {fields.metricLabel ? (
          <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>
            {fields.metricLabel}
          </div>
        ) : null}
        {fields.subhead ? (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              opacity: 0.8,
              maxWidth: width - 128,
            }}
          >
            {fields.subhead}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function quoteCardTemplate(ctx: TemplateRenderContext): ReactNode {
  const { brand, fields, width, height, logoDataUri } = ctx
  const attribution = fields.attribution ?? fields.subhead

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background: brand.primaryColor,
        padding: 72,
        fontFamily: "Inter",
        color: "#ffffff",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 48,
          left: 72,
          fontSize: 160,
          lineHeight: 1,
          color: brand.accentColor,
          opacity: 0.35,
          fontWeight: 700,
        }}
      >
        {"\u201C"}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: 32,
          paddingTop: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {fields.quote ?? fields.headline ?? "Your quote here"}
        </div>
        {attribution ? (
          <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>
            {`\u2014 ${attribution}`}
          </div>
        ) : null}
      </div>

      {brandRow(brand, logoDataUri, 48)}
    </div>
  )
}

export function photoLaunchOverlayTemplate(ctx: TemplateRenderContext): ReactNode {
  const { brand, fields, width, height, logoDataUri, fontScale } = ctx
  const scale = fontScale ?? {
    headline: 56,
    subhead: 28,
    brand: 22,
    logo: 52,
    badge: 16,
    padding: 64,
  }
  const textShadow = "0 2px 24px rgba(0,0,0,0.55)"

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: scale.padding,
        fontFamily: "Inter",
        color: "#ffffff",
        background: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {brandRow(brand, logoDataUri, scale.logo, scale.brand)}

        {fields.badge ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: brand.accentColor,
              color: brand.primaryColor,
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: scale.badge,
              fontWeight: 700,
            }}
          >
            {fields.badge}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: scale.headline,
            fontWeight: 700,
            lineHeight: 1.08,
            textShadow,
            maxWidth: width - scale.padding * 2,
          }}
        >
          {fields.headline ?? "Launch announcement"}
        </div>
        {fields.subhead ? (
          <div
            style={{
              display: "flex",
              fontSize: scale.subhead,
              lineHeight: 1.3,
              opacity: 0.95,
              textShadow,
              maxWidth: width - scale.padding * 2,
            }}
          >
            {fields.subhead}
          </div>
        ) : null}
      </div>
    </div>
  )
}
