import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["demo.rfq.honeycombai.in"],
    },
  },
}

export default nextConfig
