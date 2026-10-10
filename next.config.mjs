/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  agentRules: false,
  serverExternalPackages: ["sharp", "@resvg/resvg-js", "playwright-core"],
}

export default nextConfig
