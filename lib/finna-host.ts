export function isFinnaHost(host: string | null) {
  if (!host) return false
  const hostname = host.split(":")[0]?.toLowerCase()
  return hostname === "finna.mytrackify.com" || hostname === "finna.localhost"
}
