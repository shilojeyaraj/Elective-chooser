# 🔄 Supabase Keep-Alive Setup

This guide explains how to keep your Supabase project active on the free tier to prevent it from pausing due to inactivity.

## 🎯 Problem

Supabase free tier projects pause after **7 days of inactivity**. This means:
- Your database becomes unavailable
- Your production app stops working
- Users can't access your application

## ✅ Solution

We've implemented an automatic keep-alive system that pings your Supabase database **once per day** to keep it active. Since Supabase only pauses after 7 days of inactivity, a daily ping is sufficient.

## 📁 Files Created

1. **`/api/keepalive/route.ts`** - Endpoint that performs a lightweight database query
2. **`vercel.json`** - Cron job configuration (if using Vercel)

## 🚀 Setup Instructions

### Option 1: Vercel Cron Jobs (Recommended - Automatic)

If you're deploying to Vercel, the cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/keepalive",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

This automatically pings your Supabase once per day at noon UTC.

**To activate:**
1. Deploy to Vercel
2. The cron job will automatically start running
3. Check Vercel dashboard → Your Project → Cron Jobs to verify it's active

### Option 2: External Cron Service (Backup/Alternative)

If you're not using Vercel or want a backup, use an external cron service:

#### Using cron-job.org (Free)

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Add a new cron job:
   - **URL**: `https://your-domain.vercel.app/api/keepalive`
   - **Schedule**: Once per day (`0 12 * * *` - daily at noon UTC)
   - **Request Method**: GET
4. Save and activate

#### Using EasyCron (Free Tier)

1. Go to [EasyCron](https://www.easycron.com)
2. Sign up for free account
3. Create new cron job:
   - **URL**: `https://your-domain.vercel.app/api/keepalive`
   - **Schedule**: Once per day (daily at noon UTC)
   - **HTTP Method**: GET
4. Save and enable

#### Using UptimeRobot (Free - 50 monitors)

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create free account
3. Add new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-domain.vercel.app/api/keepalive`
   - **Interval**: 5 minutes (free tier)
4. Save monitor

### Option 3: Manual Testing

You can manually test the keep-alive endpoint:

```bash
# Test locally
curl http://localhost:3000/api/keepalive

# Test production
curl https://your-domain.vercel.app/api/keepalive
```

Expected response:
```json
{
  "status": "success",
  "message": "Supabase connection active",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "profileCount": 0
}
```

## 🔍 How It Works

The keep-alive endpoint:
1. Performs a lightweight database query (count query on profiles table)
2. This keeps the Supabase connection active
3. Prevents the project from being paused due to inactivity
4. Returns a success response with timestamp

## ⚙️ Configuration

### Adjusting Ping Frequency

To change how often Supabase is pinged, modify the cron schedule in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/keepalive",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

**Recommended schedules:**
- `0 12 * * *` - Once per day at noon UTC (default, sufficient since Supabase pauses after 7 days)
- `0 12 * * 1,4` - Twice per week (Monday and Thursday at noon)
- `0 12 * * 1` - Once per week (Monday at noon - minimum to prevent pausing)

### Cron Schedule Format

The schedule uses standard cron syntax:
```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0 or 7 = Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

Examples:
- `*/10 * * * *` - Every 10 minutes
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Once per day at midnight

## ✅ Verification

After setup, verify it's working:

1. **Check Vercel Dashboard:**
   - Go to your project
   - Navigate to "Cron Jobs" section
   - Verify the keep-alive job is listed and active

2. **Check Logs:**
   - In Vercel dashboard → Functions → View logs
   - Look for `/api/keepalive` requests daily at noon UTC
   - Should see "✅ Supabase keep-alive ping successful"

3. **Test Endpoint:**
   ```bash
   curl https://your-domain.vercel.app/api/keepalive
   ```

4. **Monitor Supabase:**
   - Go to Supabase dashboard
   - Check "Activity" tab
   - You should see periodic queries from the keep-alive endpoint

## 🎯 Benefits

- ✅ **Free solution** - No need to upgrade Supabase plan
- ✅ **Automatic** - Runs in background without manual intervention
- ✅ **Lightweight** - Minimal database queries, no performance impact
- ✅ **Reliable** - Keeps your production app always available
- ✅ **Resume-ready** - Your projects stay active for your portfolio

## 🚨 Troubleshooting

### Cron job not running

1. **Check Vercel project settings:**
   - Ensure you're on a paid Vercel plan (cron jobs require Pro plan)
   - Or use external cron service (free alternative)

2. **Verify endpoint works:**
   ```bash
   curl https://your-domain.vercel.app/api/keepalive
   ```

3. **Check environment variables:**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

### Supabase still pausing

1. **Increase ping frequency:**
   - Change schedule to `0 12 * * 1,4` (twice per week) or `0 12 * * *` (daily)

2. **Check Supabase activity:**
   - Go to Supabase dashboard → Activity
   - Verify queries are being logged

3. **Verify cron job is active:**
   - Check Vercel dashboard → Cron Jobs
   - Or check external cron service dashboard

## 📝 Notes

- The keep-alive query is very lightweight (just a count query)
- It won't impact your database performance or quota
- Free Supabase tier allows unlimited queries, so this is safe
- The endpoint returns 200 even on errors to prevent cron failures
- You can monitor the endpoint in your application logs

## 🔗 Related Files

- `frontend/src/app/api/keepalive/route.ts` - Keep-alive endpoint
- `vercel.json` - Cron job configuration
- `docs/DEPLOYMENT.md` - Full deployment guide

