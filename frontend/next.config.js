/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Vercel compatibility
  compress: true,
  poweredByHeader: false,
  // Cloudflare Pages configuration
  output: 'standalone',
  // Fix Windows file system issues
  outputFileTracingRoot: undefined,
  experimental: {
    outputFileTracingRoot: undefined
  }
}

module.exports = nextConfig