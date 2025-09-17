/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable CSS optimization temporarily to fix styling issues
  experimental: {
    // optimizeCss: true, // Disabled for debugging
  },
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Set workspace root to avoid lockfile warnings
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
}

module.exports = nextConfig