import type { NextConfig } from "next"

// Always include the known production domain.
// Vercel automatically sets VERCEL_URL (per-deployment) and VERCEL_BRANCH_URL
// (stable per-branch alias) at build time, so every deployment URL is covered
// without having to hardcode anything.
const allowedOrigins = ["demo.rfq.honeycombai.in"]
if (process.env.VERCEL_URL) allowedOrigins.push(process.env.VERCEL_URL)
if (process.env.VERCEL_BRANCH_URL) allowedOrigins.push(process.env.VERCEL_BRANCH_URL)
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) allowedOrigins.push(process.env.VERCEL_PROJECT_PRODUCTION_URL)

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins },
  },
  // Bundle every PNG under app/ into all serverless functions so
  // fs.readFile can serve them regardless of which org folder they live in.
  outputFileTracingIncludes: {
    "**": ["./app/**/*.png"],
  },
}

export default nextConfig
