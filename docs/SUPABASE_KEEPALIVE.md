# 🔄 Supabase Keep-Alive Implementation Guide

## 🎯 Problem Statement

**Supabase Free Tier Limitation:** Projects on the free tier automatically pause after **7 days of complete inactivity**. When paused:
- ❌ Database becomes unavailable
- ❌ Production application stops working
- ❌ Users cannot access your application
- ❌ Your portfolio projects go offline

**Solution:** Implement an automatic keep-alive system that periodically pings your Supabase database to prevent it from being paused.

---

## ✅ Best Implementation Method

### **Recommended Approach: External Cron Service (Free & Reliable)**

Since Vercel cron jobs require a Pro plan ($20/month), the **best free solution** is to use an external cron service. This is:
- ✅ **100% Free** - No paid plans needed
- ✅ **Reliable** - Professional uptime monitoring
- ✅ **Easy Setup** - Takes 5 minutes
- ✅ **Works with any hosting** - Not tied to Vercel

---

## 🚀 Step-by-Step Implementation

### Step 1: Verify Keep-Alive Endpoint Works

First, ensure your keep-alive endpoint is deployed and accessible:

```bash
# Test locally (if running dev server)
curl http://localhost:3000/api/keepalive

# Test production (after deployment)
curl https://your-app.vercel.app/api/keepalive
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

### Step 2: Choose Your Cron Service

#### **Option A: cron-job.org (Recommended - Easiest)**

**Why it's best:**
- ✅ Completely free
- ✅ No credit card required
- ✅ Simple interface
- ✅ Reliable uptime
- ✅ Email notifications

**Setup Steps:**

1. **Create Account:**
   - Go to [https://cron-job.org](https://cron-job.org)
   - Click "Sign Up" (free, no credit card)
   - Verify your email

2. **Create Cron Job:**
   - Click "Create cronjob"
   - Fill in the details:
     ```
     Title: Supabase Keep-Alive
     Address: https://your-app.vercel.app/api/keepalive
     Schedule: Once per day
     Notification: Email on failure (optional)
     ```
   
3. **Set Schedule:**
   - Click "Advanced" or "Schedule"
   - Select "Daily"
   - Set time to **12:00 UTC** (or any time you prefer)
   - Or use cron expression: `0 12 * * *`

4. **Save and Activate:**
   - Click "Create cronjob"
   - Verify it shows as "Active"

**That's it!** Your Supabase will now be pinged daily.

---

#### **Option B: UptimeRobot (Alternative - More Features)**

**Why it's good:**
- ✅ Free tier: 50 monitors
- ✅ Uptime monitoring included
- ✅ Mobile app available
- ✅ More frequent checks (5 min intervals)

**Setup Steps:**

1. **Create Account:**
   - Go to [https://uptimerobot.com](https://uptimerobot.com)
   - Sign up for free account

2. **Add Monitor:**
   - Click "Add New Monitor"
   - Select type: **HTTP(s)**
   - Fill in:
     ```
     Friendly Name: Supabase Keep-Alive
     URL: https://your-app.vercel.app/api/keepalive
     Monitoring Interval: 5 minutes (free tier)
     ```
   - Click "Create Monitor"

3. **Verify:**
   - Monitor should show as "Up"
   - You'll get notifications if it goes down

---

#### **Option C: EasyCron (Alternative)**

1. Go to [https://www.easycron.com](https://www.easycron.com)
2. Sign up for free account
3. Create new cron job with your keep-alive URL
4. Set to run daily

---

### Step 3: Verify It's Working

**After 24 hours, verify:**

1. **Check Cron Service Dashboard:**
   - Look for successful executions
   - Should show green/active status

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for `/api/keepalive` requests
   - Should see logs with "✅ Supabase keep-alive ping successful"

3. **Check Supabase Dashboard:**
   - Go to Supabase Dashboard → Your Project → Activity
   - You should see periodic queries from the keep-alive endpoint
   - Look for `SELECT` queries on the `profiles` table

4. **Test Manually:**
   ```bash
   curl https://your-app.vercel.app/api/keepalive
   ```
   Should return success response

---

## 📋 Implementation Checklist

- [ ] Keep-alive endpoint deployed (`/api/keepalive`)
- [ ] Endpoint tested and returns success
- [ ] External cron service account created
- [ ] Cron job configured with correct URL
- [ ] Schedule set to daily (or at least weekly)
- [ ] Cron job activated and showing as "Active"
- [ ] Verified first execution in cron service dashboard
- [ ] Checked Vercel logs for successful requests
- [ ] Verified Supabase activity shows queries

---

## ⚙️ Configuration Details

### Keep-Alive Endpoint

**Location:** `frontend/src/app/api/keepalive/route.ts`

**What it does:**
- Performs lightweight `SELECT COUNT(*)` query on `profiles` table
- Keeps Supabase connection active
- Returns success even on errors (to prevent cron failures)
- Logs activity for monitoring

**Query Details:**
```typescript
const { count, error } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .limit(1)
```

This query:
- ✅ Uses minimal resources (count query, not full data)
- ✅ Fast execution (< 100ms typically)
- ✅ Doesn't consume significant quota
- ✅ Safe to run frequently

### Recommended Schedule

**Best Practice: Once per day**

Since Supabase pauses after **7 days** of inactivity:
- **Minimum:** Once per week (e.g., every Monday)
- **Recommended:** Once per day (e.g., noon UTC)
- **Overkill but safe:** Every 6-12 hours

**Cron Schedule Examples:**
```
0 12 * * *     # Daily at noon UTC (recommended)
0 12 * * 1     # Every Monday at noon UTC (minimum)
0 12 * * 1,4   # Monday and Thursday at noon (safe)
0 */6 * * *    # Every 6 hours (overkill but very safe)
```

---

## 🔍 Monitoring & Verification

### Daily Monitoring (First Week)

After setup, monitor for the first week to ensure it's working:

1. **Day 1:** Check cron service shows successful execution
2. **Day 2:** Verify Vercel logs show the request
3. **Day 3:** Check Supabase activity shows the query
4. **Day 4-7:** Continue monitoring to ensure consistency

### Weekly Check (Ongoing)

Once confirmed working, check weekly:
- Cron service dashboard shows active status
- No error notifications received
- Supabase project remains active (not paused)

### Monthly Verification

Once per month:
- Test the endpoint manually
- Verify Supabase project status
- Check for any service changes

---

## 🚨 Troubleshooting

### Issue: Cron Job Not Executing

**Symptoms:**
- Cron service shows failures
- No requests in Vercel logs
- Supabase still pausing

**Solutions:**
1. **Verify URL is correct:**
   ```bash
   curl https://your-app.vercel.app/api/keepalive
   ```
   Should return JSON response

2. **Check Vercel deployment:**
   - Ensure app is deployed and running
   - Check for deployment errors

3. **Verify endpoint exists:**
   - Check `frontend/src/app/api/keepalive/route.ts` exists
   - Ensure it's been committed and deployed

4. **Check cron service settings:**
   - Verify URL is correct (include `https://`)
   - Check schedule is active
   - Ensure no authentication required

### Issue: Supabase Still Pausing

**Symptoms:**
- Supabase project shows as "Paused"
- Database unavailable

**Solutions:**
1. **Increase frequency:**
   - Change from weekly to daily
   - Or from daily to twice daily

2. **Verify queries are executing:**
   - Check Supabase Activity tab
   - Should see queries from keep-alive endpoint

3. **Check for errors:**
   - Review Vercel function logs
   - Check for Supabase connection errors

4. **Manual wake-up:**
   - If already paused, manually query Supabase dashboard
   - This will wake it up
   - Then ensure cron job is working

### Issue: Endpoint Returns Errors

**Symptoms:**
- Keep-alive endpoint returns 500 error
- Vercel logs show errors

**Solutions:**
1. **Check environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` is set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
   - Variables are set in Vercel dashboard

2. **Verify Supabase connection:**
   - Test Supabase connection manually
   - Check if Supabase project is active

3. **Check database tables:**
   - Ensure `profiles` table exists
   - Verify table permissions are correct

---

## 💡 Best Practices

### 1. Use External Cron Service (Not Vercel Cron)

**Why:**
- Vercel cron requires Pro plan ($20/month)
- External services are free and reliable
- Not tied to specific hosting platform

### 2. Set to Daily (Not More Frequent)

**Why:**
- Supabase pauses after 7 days, so daily is sufficient
- Reduces unnecessary API calls
- Saves resources

### 3. Monitor for First Week

**Why:**
- Ensures setup is correct
- Catches issues early
- Builds confidence in the system

### 4. Set Up Notifications

**Why:**
- Get alerted if cron job fails
- Know immediately if there's an issue
- Can fix problems before Supabase pauses

### 5. Test After Deployment

**Why:**
- Verify endpoint works in production
- Ensure environment variables are set
- Confirm cron service can reach your endpoint

---

## 📊 Cost Analysis

### Free Solution (Recommended)
- **cron-job.org:** Free forever
- **UptimeRobot:** Free (50 monitors)
- **EasyCron:** Free tier available
- **Total Cost:** $0/month

### Paid Alternative (If Needed)
- **Vercel Pro:** $20/month (includes cron jobs)
- **Total Cost:** $20/month

**Recommendation:** Use free external cron service. No need to pay for Vercel Pro just for this feature.

---

## 🎯 Success Criteria

Your implementation is successful when:

✅ Cron job executes daily without errors  
✅ Vercel logs show successful keep-alive requests  
✅ Supabase Activity shows periodic queries  
✅ Supabase project remains active (not paused)  
✅ No manual intervention needed  
✅ Application stays online 24/7  

---

## 📝 Maintenance

### Monthly Tasks
- [ ] Verify cron job is still active
- [ ] Check for any error notifications
- [ ] Test endpoint manually
- [ ] Verify Supabase project status

### Quarterly Tasks
- [ ] Review cron service account status
- [ ] Check for service updates/changes
- [ ] Verify no changes needed to endpoint
- [ ] Update documentation if needed

---

## 🔗 Related Files

- **Keep-Alive Endpoint:** `frontend/src/app/api/keepalive/route.ts`
- **Vercel Config:** `vercel.json` (cron config, but use external service instead)
- **Supabase Client:** `frontend/src/lib/supabase.ts`

---

## 📚 Additional Resources

- [Supabase Free Tier Documentation](https://supabase.com/docs/guides/platform/tier-limits)
- [cron-job.org Documentation](https://cron-job.org/en/help/)
- [UptimeRobot Documentation](https://uptimerobot.com/api/)
- [Cron Expression Guide](https://crontab.guru/)

---

## ✅ Quick Start Summary

**Fastest Setup (5 minutes):**

1. Deploy your app to Vercel
2. Test: `curl https://your-app.vercel.app/api/keepalive`
3. Go to [cron-job.org](https://cron-job.org)
4. Sign up (free)
5. Create cron job:
   - URL: `https://your-app.vercel.app/api/keepalive`
   - Schedule: Daily at noon UTC
6. Activate
7. Done! ✅

Your Supabase will now stay active forever (as long as the cron job runs).

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready
