import type { SocialConnection } from "@/lib/social/types"

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"

export const LINKEDIN_SCOPES = ["openid", "profile", "w_member_social", "email"]

export function getLinkedInRedirectUri(origin: string): string {
  return process.env.LINKEDIN_REDIRECT_URI?.trim() || `${origin}/api/social/linkedin/callback`
}

export function buildLinkedInAuthUrl(state: string, origin: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  if (!clientId) {
    throw new Error("LINKEDIN_CLIENT_ID is not configured")
  }

  const url = new URL(LINKEDIN_AUTH_URL)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", getLinkedInRedirectUri(origin))
  url.searchParams.set("state", state)
  url.searchParams.set("scope", LINKEDIN_SCOPES.join(" "))
  return url.toString()
}

type TokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
}

type UserInfo = {
  sub: string
  name?: string
  email?: string
}

export async function exchangeLinkedInCode(
  code: string,
  origin: string
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  profileId: string
  profileUrn: string
  displayName?: string
}> {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn OAuth is not configured")
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getLinkedInRedirectUri(origin),
    client_id: clientId,
    client_secret: clientSecret,
  })

  const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    throw new Error(`LinkedIn token exchange failed: ${text}`)
  }

  const tokenData = (await tokenRes.json()) as TokenResponse
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    throw new Error("Failed to fetch LinkedIn profile")
  }

  const user = (await userRes.json()) as UserInfo
  const profileId = user.sub

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    profileId,
    profileUrn: `urn:li:person:${profileId}`,
    displayName: user.name,
  }
}

export async function refreshLinkedInToken(
  connection: SocialConnection
): Promise<SocialConnection> {
  if (!connection.refreshToken) return connection
  if (connection.expiresAt.getTime() > Date.now() + 60_000) return connection

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (!clientId || !clientSecret) return connection

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: connection.refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) return connection

  const data = (await res.json()) as TokenResponse
  return {
    ...connection,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? connection.refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    updatedAt: new Date(),
  }
}

export function isLinkedInConfigured(): boolean {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() && process.env.LINKEDIN_CLIENT_SECRET?.trim()
  )
}
