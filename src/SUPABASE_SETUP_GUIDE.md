# 🔑 Supabase Setup Guide - Environment Variables

## Required Environment Variables

Your Persian Connect backend requires these 3 environment variables to connect to your Supabase database:

### 1. SUPABASE_URL
**Value:** `https://tnnaitaovinhtgoqtuvs.supabase.co`
**Where to find:** Supabase Dashboard → Settings → API → Project URL

### 2. SUPABASE_ANON_KEY  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubmFpdGFvdmluaHRnb3F0dXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTA0ODMsImV4cCI6MjA3NDIyNjQ4M30.v_ZCFuHLyfrFV7BDnjkH6Fk7gzgnNpmLX1mS_fkgjpU`

### 3. SUPABASE_SERVICE_ROLE_KEY
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubmFpdGFvdmluaHRnb3F0dXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY1MDQ4MywiZXhwIjoyMDc0MjI2NDgzfQ.GIDwOCWc02lrAGeV1cFw4gvRsaWxbavj-VrkwAWtqN4`
**⚠️ Keep this secret! Never share or commit to version control.**

## How to Set Environment Variables

### Option 1: Figma Make Environment Variables
If you're using Figma Make's deployment:
1. Go to your project settings in Figma Make
2. Add these 3 environment variables with your values

### Option 2: Netlify Deployment
If you deploy to Netlify:
1. Go to your Netlify dashboard
2. Site settings → Environment variables
3. Add the 3 variables above

### Option 3: Vercel Deployment  
If you deploy to Vercel:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add the 3 variables above

## 🔒 Security Notes

- **Never share your service_role key** - it has admin access to your database
- **The anon key is safe** to use in frontend code
- **Always use HTTPS** for your Supabase URL

## ✅ Testing Your Setup

Once configured, your app will:
- ✅ Create real user accounts instead of demo users
- ✅ Store actual ads in your Supabase database  
- ✅ Enable real-time messaging between users
- ✅ Upload images to Supabase Storage
- ✅ Process payments (when Stripe is configured)
- ✅ Admin dashboard shows real data

## 🚨 Database Setup

Your backend will automatically:
- ✅ Create the required KV store table
- ✅ Set up storage buckets for images/files
- ✅ Initialize all necessary data structures

No manual database setup required! 🎉

## Need Help?

If you encounter issues:
1. Check that all 3 environment variables are set correctly
2. Verify your Supabase project is active
3. Ensure your API keys are copied correctly (no extra spaces)
4. Check your deployment platform's logs for errors

Your Persian Connect marketplace will transition from demo mode to live backend automatically once these variables are configured! 🚀