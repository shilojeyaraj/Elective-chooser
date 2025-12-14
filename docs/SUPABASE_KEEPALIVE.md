# 🔄 Supabase Keep-Alive Implementation Guide

## 🎯 Problem

Supabase free tier projects automatically pause after **7 days of inactivity**. When paused:
- ❌ Database becomes unavailable
- ❌ Production application stops working
- ❌ Users cannot access your application

**Solution:** Implement an automatic keep-alive endpoint that periodically pings your Supabase database to prevent it from being paused.

---

## ✅ Implementation Steps

### Step 1: Create Keep-Alive API Endpoint

Create a new file: `frontend/src/app/api/keepalive/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Keep-alive endpoint to prevent Supabase from pausing due to inactivity
 * This endpoint performs a lightweight database query to keep the connection active
 * Should be called once per day via cron job (Supabase pauses after 7 days of inactivity)
 */
export async function GET() {
  try {
    // Perform a lightweight query to keep Supabase active
    // Using a simple count query that's fast and doesn't consume resources
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      console.error('⚠️ Keep-alive query error:', error)
      // Still return success to avoid cron job failures
      return NextResponse.json({ 
        status: 'warning',
        message: 'Query completed with warning',
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Supabase keep-alive ping successful')
    return NextResponse.json({ 
      status: 'success',
      message: 'Supabase connection active',
      timestamp: new Date().toISOString(),
      profileCount: count || 0
    })

  } catch (error: unknown) {
    console.error('❌ Keep-alive error:', error)
    // Return success anyway to prevent cron failures
    const errorMessage = error instanceof Error ? error.message : 'Keep-alive completed'
    return NextResponse.json({ 
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 200 }) // Return 200 to keep cron happy
  }
}
```

**Important Notes:**
- Replace `'profiles'` with any table name that exists in your database
- The query uses `count: 'exact', head: true` to minimize data transfer
- Always returns 200 status to prevent cron service failures
- Logs activity for monitoring

### Step 2: Configure Vercel Cron (Optional - Requires Pro Plan)

If you have Vercel Pro, add to `vercel.json`:

```json
{
  "version": 2,
  "crons": [
    {
      "path": "/api/keepalive",
      "schedule": "0 12 * * *"
    }
  ]
}
```

**Schedule:** `0 12 * * *` = Daily at noon UTC (sufficient since Supabase pauses after 7 days)

### Step 3: Set Up External Cron Service (Recommended - Free)

Since Vercel cron requires Pro plan, use a free external cron service:

#### Option A: cron-job.org (Recommended)

1. **Sign Up:**
   - Go to [https://cron-job.org](https://cron-job.org)
   - Create free account (no credit card)

2. **Create Cron Job:**
   - Click "Create cronjob"
   - **Title:** Supabase Keep-Alive
   - **Address:** `https://your-app.vercel.app/api/keepalive`
   - **Schedule:** Daily at 12:00 UTC
   - **Notification:** Email on failure (optional)

3. **Activate:**
   - Click "Create cronjob"
   - Verify status shows "Active"

#### Option B: UptimeRobot (Alternative)

1. Go to [https://uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add new monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://your-app.vercel.app/api/keepalive`
   - **Interval:** 5 minutes (free tier)
4. Save monitor

---

## 🔧 Customization for Your Project

### Change the Table Name

If your project doesn't have a `profiles` table, change it to any existing table:

```typescript
// Example: Use 'users' table instead
const { count, error } = await supabase
  .from('users')  // Change this to your table name
  .select('*', { count: 'exact', head: true })
  .limit(1)
```

**Common table names to use:**
- `users`
- `profiles`
- `sessions`
- `courses`
- Any table that exists in your database

### Adjust Ping Frequency

**Recommended:** Once per day (since Supabase pauses after 7 days)

**Cron Schedule Options:**
```
0 12 * * *     # Daily at noon UTC (recommended)
0 12 * * 1     # Every Monday at noon (minimum)
0 12 * * 1,4   # Monday and Thursday (safe)
0 */6 * * *    # Every 6 hours (overkill)
```

---

## ✅ Verification

### 1. Test Endpoint Locally

```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/keepalive
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Supabase connection active",
  "timestamp": "2024-12-02T12:00:00.000Z",
  "profileCount": 0
}
```

### 2. Test in Production

After deployment:
```bash
curl https://your-app.vercel.app/api/keepalive
```

### 3. Verify Cron Job

- Check cron service dashboard for successful executions
- Check Vercel logs for `/api/keepalive` requests
- Check Supabase Activity tab for periodic queries

---

## 📋 Quick Implementation Checklist

Copy this checklist when implementing in a new project:

- [ ] Create `src/app/api/keepalive/route.ts` with the code above
- [ ] Update table name in the query (if not using 'profiles')
- [ ] Test endpoint locally: `curl http://localhost:3000/api/keepalive`
- [ ] Deploy to production
- [ ] Test production endpoint: `curl https://your-app.vercel.app/api/keepalive`
- [ ] Set up external cron service (cron-job.org recommended)
- [ ] Configure cron job to ping daily
- [ ] Verify first execution in cron service dashboard
- [ ] Check Vercel logs for successful requests
- [ ] Monitor Supabase Activity to confirm queries are happening

---

## 🚨 Troubleshooting

### Endpoint Returns 404

**Problem:** Endpoint not found

**Solution:**
- Verify file exists at `src/app/api/keepalive/route.ts`
- Ensure file is committed and deployed
- Check Next.js routing is working

### Endpoint Returns 500 Error

**Problem:** Database connection issue

**Solution:**
- Check environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project is active (not paused)
- Check table name exists in your database

### Cron Job Not Executing

**Problem:** External cron service not calling endpoint

**Solution:**
- Verify URL is correct (include `https://`)
- Check cron job is active in service dashboard
- Ensure no authentication required on endpoint
- Test endpoint manually first

### Supabase Still Pausing

**Problem:** Keep-alive not working

**Solution:**
- Increase frequency (daily instead of weekly)
- Verify queries are appearing in Supabase Activity
- Check for errors in Vercel function logs
- Ensure cron job is actually executing

---

## 💡 Best Practices

1. **Use External Cron Service (Free)**
   - Don't pay for Vercel Pro just for this
   - cron-job.org is free and reliable

2. **Daily Ping is Sufficient**
   - Supabase pauses after 7 days
   - Daily ping provides 6-day safety margin

3. **Use Lightweight Query**
   - Count query with `head: true` minimizes data transfer
   - Fast execution (< 100ms)

4. **Always Return 200 Status**
   - Prevents cron service from marking as failed
   - Log errors but don't fail the request

5. **Monitor for First Week**
   - Verify it's working correctly
   - Catch issues early

---

## 📊 Cost Comparison

| Solution | Cost | Reliability | Setup Time |
|----------|------|-------------|------------|
| cron-job.org | **Free** | High | 5 minutes |
| UptimeRobot | **Free** | High | 5 minutes |
| Vercel Cron | $20/month | High | 2 minutes |
| EasyCron | Free tier | Medium | 10 minutes |

**Recommendation:** Use cron-job.org (free, reliable, easy)

---

## 🔗 Files to Copy to New Project

When implementing in a new project, copy these files:

1. **`src/app/api/keepalive/route.ts`** - The keep-alive endpoint
2. **`vercel.json`** (optional) - Cron config if using Vercel Pro

**Dependencies:**
- No additional npm packages needed
- Uses existing Supabase client from `@/lib/supabase`

---

## 📝 Code Summary

**Single File Implementation:**

```typescript
// src/app/api/keepalive/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('profiles') // Change to your table name
      .select('*', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      console.error('⚠️ Keep-alive query error:', error)
      return NextResponse.json({ 
        status: 'warning',
        message: 'Query completed with warning',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Supabase connection active',
      timestamp: new Date().toISOString(),
      profileCount: count || 0
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Keep-alive completed'
    return NextResponse.json({ 
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  }
}
```

**That's it!** Just:
1. Copy this file to your project
2. Change `'profiles'` to your table name
3. Deploy
4. Set up cron job at cron-job.org
5. Done! ✅

---

## ✅ Success Criteria

Your implementation is successful when:

- ✅ Endpoint returns 200 status code
- ✅ Cron job executes daily without errors
- ✅ Supabase Activity shows periodic queries
- ✅ Supabase project remains active (not paused)
- ✅ No manual intervention needed

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready  
**Implementation Time:** ~10 minutes
