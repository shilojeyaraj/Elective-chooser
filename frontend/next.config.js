/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Vercel compatibility
  compress: true,
  poweredByHeader: false,
  // Cloudflare Pages configuration
  output: 'standalone',
}

module.exports = nextConfig