# 🚀 Quick Setup Guide

## Step 1: Create Environment File

Create a `.env.local` file in your project root with your API keys:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_key_here
```

## Step 2: Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the entire contents of `supabase-schema.sql` and paste it into the SQL editor
4. Click **Run** to create all the tables

## Step 3: Get Your Supabase Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the **Project URL** (for SUPABASE_URL)
3. Copy the **anon public** key (for SUPABASE_KEY)
4. Copy the **service_role** key (for SUPABASE_SERVICE_ROLE_KEY)

## Step 4: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `sk-`)

## Step 5: Upload Your Data

You already have the processed CSV files! Now upload them:

### Option A: Use the Admin Interface
1. Start the app: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Upload `processed_courses.csv` and `processed_programs.csv`

### Option B: Use Python Script
```bash
python scripts/simple_uw_processor.py uw_engineering_core_by_program_TIDY.json
```

## Step 6: Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your chatbot!

## 🎉 You're Done!

Your Waterloo Elective Chooser is now ready with:
- ✅ 284 courses from 11 engineering programs
- ✅ AI-powered recommendations
- ✅ User authentication
- ✅ Chat interface
- ✅ Course ranking system

## Troubleshooting

**If you get "supabaseUrl is required" error:**
- Make sure your `.env.local` file exists and has the correct Supabase URL

**If you get database errors:**
- Make sure you ran the SQL schema in Supabase
- Check that your service role key is correct

**If you get OpenAI errors:**
- Make sure your OpenAI API key is valid and has credits
