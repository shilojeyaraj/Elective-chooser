#!/bin/bash

# Cloudflare Pages Build Script
# This script ensures proper build for Cloudflare Pages deployment

set -e

echo "🚀 Building for Cloudflare Pages..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run the build
echo "🔨 Running Next.js build..."
npm run build

# Verify the build output
echo "✅ Verifying build output..."
if [ -d "out" ]; then
    echo "📁 Build output directory 'out' created successfully"
    echo "📊 Build size:"
    du -sh out/
    echo "📋 Largest files:"
    find out -type f -exec ls -lh {} \; | sort -k5 -hr | head -5
else
    echo "❌ Build output directory 'out' not found"
    exit 1
fi

echo "🎉 Build completed successfully!"
