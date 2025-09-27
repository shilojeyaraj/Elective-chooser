# 🚀 Elective Chooser - Deployment Guide

This guide covers multiple deployment options for your University of Waterloo Elective Chooser application.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ **Environment variables** configured (see Environment Setup below)
- ✅ **Supabase database** set up and populated
- ✅ **OpenAI API key** for AI functionality
- ✅ **Production build** tested locally (`npm run build`)

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file in the `frontend/` directory with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### Getting Your Keys

1. **Supabase Keys:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key
   - For service role key, use the service_role key (keep this secret!)

2. **OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all required environment variables

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

The `vercel.json` file is already configured for you with:
- ✅ Next.js framework detection
- ✅ Environment variable mapping
- ✅ Build optimization

### Option 2: Docker Deployment

Deploy using Docker for maximum control and portability.

#### Steps:

1. **Build Docker Image:**
   ```bash
   docker build -t elective-chooser .
   ```

2. **Run Container:**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
     -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
     -e OPENAI_API_KEY=your_openai_key \
     elective-chooser
   ```

3. **Or use Docker Compose:**
   ```bash
   # Create .env file with your variables
   docker-compose up -d
   ```

#### Docker Configuration

- ✅ **Multi-stage build** for optimized image size
- ✅ **Non-root user** for security
- ✅ **Health checks** for monitoring
- ✅ **Production optimizations**

### Option 3: Railway

Deploy to Railway for easy database integration.

#### Steps:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key
   railway variables set OPENAI_API_KEY=your_openai_key
   ```

### Option 4: Netlify

Deploy to Netlify with serverless functions.

#### Steps:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy:**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=.next
   ```

3. **Set Environment Variables:**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all required variables

## 🔍 Post-Deployment Checklist

After deployment, verify:

- [ ] **Application loads** without errors
- [ ] **Login/signup** functionality works
- [ ] **Chat interface** responds correctly
- [ ] **Course recommendations** appear
- [ ] **Database connection** is working
- [ ] **Environment variables** are properly set

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies: `npm install`

2. **Environment Variables:**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no typos in values

3. **Database Connection:**
   - Verify Supabase URL and keys
   - Check RLS policies are configured
   - Ensure database is populated

4. **API Errors:**
   - Check OpenAI API key is valid
   - Verify API rate limits
   - Check network connectivity

### Debug Commands:

```bash
# Test build locally
npm run build

# Check environment variables
npm run dev

# Test database connection
# (Check browser console for Supabase logs)

# Verify API endpoints
curl https://your-domain.com/api/chat
```

## 📊 Monitoring

### Health Checks:

- **Application Health:** `https://your-domain.com/api/health`
- **Database Status:** Check Supabase dashboard
- **API Status:** Monitor OpenAI usage

### Performance:

- **Build Size:** Check Vercel/Netlify build logs
- **Load Time:** Use browser dev tools
- **API Response:** Monitor chat response times

## 🔒 Security Considerations

- ✅ **Environment variables** are properly secured
- ✅ **Service role key** is not exposed to client
- ✅ **API keys** are stored securely
- ✅ **Database RLS** policies are configured
- ✅ **HTTPS** is enabled (automatic on most platforms)

## 📈 Scaling

### For High Traffic:

1. **Database:**
   - Upgrade Supabase plan
   - Enable connection pooling
   - Add database indexes

2. **API:**
   - Implement rate limiting
   - Add caching layers
   - Monitor OpenAI usage

3. **Frontend:**
   - Enable CDN caching
   - Optimize images
   - Implement lazy loading

## 🆘 Support

If you encounter issues:

1. **Check logs** in your deployment platform
2. **Verify environment variables** are correct
3. **Test locally** with production build
4. **Check database** connection and data
5. **Review API** rate limits and quotas

---

## 🎉 You're Ready to Deploy!

Choose your preferred deployment method and follow the steps above. Your Elective Chooser application will be live and helping students choose their courses! 🚀

**Recommended:** Start with Vercel for the easiest deployment experience.
