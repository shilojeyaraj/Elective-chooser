/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Vercel compatibility
  compress: true,
  poweredByHeader: false,
  // Only use static export for Cloudflare Pages, not for Vercel (which supports API routes)
  // Set CLOUDFLARE_BUILD=true environment variable to enable static export
  ...(process.env.CLOUDFLARE_BUILD === 'true' ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
  images: {
    unoptimized: true
  },
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // More aggressive chunk splitting to stay under 25MB limit
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 20000000, // 20MB max per chunk
        cacheGroups: {
          // Split large libraries into separate chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 15,
          },
          langchain: {
            test: /[\\/]node_modules[\\/]@langchain[\\/]/,
            name: 'langchain',
            chunks: 'all',
            priority: 15,
          },
          openai: {
            test: /[\\/]node_modules[\\/]openai[\\/]/,
            name: 'openai',
            chunks: 'all',
            priority: 15,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|framer-motion)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 10,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
            maxSize: 15000000, // 15MB max for vendor chunk
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 0,
            reuseExistingChunk: true,
            maxSize: 10000000, // 10MB max for common chunk
          },
        },
      };
      
      // Note: usedExports removed - incompatible with Next.js 15 cacheUnaffected
      // Next.js handles tree-shaking automatically, so this isn't needed
      // config.optimization.sideEffects can stay as it doesn't conflict
      if (config.optimization.sideEffects === undefined) {
        config.optimization.sideEffects = false;
      }
    }
    return config;
  },
  // Fix Windows file system issues
  experimental: {
    // outputFileTracingRoot: undefined // Removed to fix warning
  }
}

module.exports = nextConfig