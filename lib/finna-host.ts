export function requestHost(source: { get(name: string): string | null }) {
  const forwarded = source.get("x-forwarded-host")
  return (forwarded || source.get("host") || "").split(",")[0]?.trim() ?? ""
}

export function isFinnaHost(host: string | null) {
  if (!host) return false
  const hostname = host.split(":")[0]?.toLowerCase()
  return (
    hostname === "finna.mytrackify.com" ||
    hostname === "finnai.mytrackify.com" ||
    hostname === "finna.localhost"
  )
}
