# Cloudflare Pages Deployment Guide

This guide will help you deploy your UW Elective Chooser application to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Already installed as a dev dependency
3. **Environment Variables**: Gather all your API keys and configuration values

## Quick Start

### 1. Build and Deploy

```bash
# Build the application
npm run build:cloudflare

# Deploy to Cloudflare Pages
npm run deploy:cloudflare
```

### 2. Set Up Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Upload assets** (for manual deployment)
5. Upload the `frontend/.next` folder after building

## Environment Variables Setup

### Required Environment Variables

Set these in your Cloudflare Pages dashboard under **Settings > Environment Variables**:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Web Search API (Tavily)
TAVILY_API_KEY=your_tavily_api_key

# Node Environment
NODE_ENV=production

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your_nextauth_secret
```

### How to Set Environment Variables

1. In Cloudflare Pages dashboard, go to your project
2. Click **Settings** tab
3. Click **Environment Variables** in the sidebar
4. Add each variable with its value
5. Make sure to set them for **Production** environment

## Deployment Methods

### Method 1: Manual Deployment (Recommended for testing)

```bash
# Build the application
npm run build:cloudflare

# Deploy using Wrangler
npm run deploy:cloudflare
```

### Method 2: Git Integration (Recommended for production)

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `frontend/.next`
   - **Root directory**: `/` (project root)

### Method 3: Wrangler Pages Deploy

```bash
# Deploy directly with Wrangler
wrangler pages deploy frontend/.next --project-name uw-elective-chooser
```

## Configuration Files

### wrangler.toml
This file configures your Cloudflare Pages project:

```toml
name = "uw-elective-chooser"
compatibility_date = "2025-10-09"

[pages]
build = { command = "cd frontend && npm run build", cwd = "." }
output_directory = "frontend/.next"

[vars]
NODE_ENV = "production"

[[pages.functions]]
pattern = "/api/*"
```

### next.config.js
Updated for Cloudflare Pages compatibility:

```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  experimental: {
    runtime: 'nodejs',
  },
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are installed: `npm install`
   - Verify Node.js version compatibility (>=18.0.0)
   - Check for TypeScript errors: `npm run type-check`

2. **Environment Variables Not Working**
   - Ensure variables are set in Cloudflare Pages dashboard
   - Check variable names match exactly (case-sensitive)
   - Redeploy after adding new variables

3. **API Routes Not Working**
   - Verify the `/api/*` pattern in wrangler.toml
   - Check that API routes are in `frontend/src/app/api/`
   - Ensure proper error handling in API routes

4. **Database Connection Issues**
   - Verify Supabase URL and keys are correct
   - Check Supabase project is active
   - Ensure database tables are properly set up

### Debug Commands

```bash
# Check build locally
npm run build:cloudflare

# Test locally with Wrangler
wrangler pages dev frontend/.next

# Check Wrangler configuration
wrangler pages project list

# View deployment logs
wrangler pages deployment tail
```

## Production Checklist

- [ ] All environment variables set in Cloudflare Pages
- [ ] Supabase database configured and accessible
- [ ] OpenAI API key valid and has credits
- [ ] Tavily API key configured (if using web search)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Cloudflare)
- [ ] Performance monitoring set up (optional)

## Custom Domain Setup

1. In Cloudflare Pages dashboard, go to **Custom domains**
2. Add your domain (e.g., `elective-chooser.yourdomain.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable to match your domain

## Monitoring and Analytics

- **Cloudflare Analytics**: Available in Pages dashboard
- **Performance**: Monitor Core Web Vitals
- **Errors**: Check Cloudflare Pages logs
- **Usage**: Monitor API usage and costs

## Support

- **Cloudflare Documentation**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Next.js on Cloudflare**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Wrangler CLI**: [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler)

## Next Steps

1. Deploy your application using the steps above
2. Test all functionality in the deployed environment
3. Set up monitoring and analytics
4. Configure custom domain if desired
5. Set up automated deployments from your Git repository
