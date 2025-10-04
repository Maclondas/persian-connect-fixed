# 🚀 Edge Function Deployment Guide

If you're getting "Server not available" errors, your Supabase Edge Function needs to be deployed.

## ✅ Quick Check

First, test if your server is deployed by visiting:
`https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e5dee741/health`

If you get a 404 error, the function isn't deployed.

## 🛠️ Deployment Methods

### Method 1: Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Deploy all functions:**
   ```bash
   supabase functions deploy
   ```

   Or deploy specific function:
   ```bash
   supabase functions deploy make-server-e5dee741
   ```

### Method 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click **"Create a new function"**
4. Name it: `make-server-e5dee741`
5. Copy the entire contents of `/supabase/functions/server/index.tsx`
6. Paste it into the function editor
7. Click **"Deploy function"**

### Method 3: Manual Upload

1. In your Supabase dashboard, go to **Edge Functions**
2. Click **"Upload function"**
3. Create a ZIP file containing:
   - `index.ts` (copy contents from `/supabase/functions/server/index.tsx`)
   - `deno.json` (create with: `{"imports": {}}`)
4. Upload and name it `make-server-e5dee741`

## 🔧 Environment Variables

Make sure these environment variables are set in your Supabase Edge Function:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

## ✅ Verify Deployment

After deployment, test these endpoints:

1. **Health Check:**
   `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e5dee741/health`
   
2. **Server Info:**
   `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e5dee741`

3. **Signup Test** (will return error but proves endpoint exists):
   `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e5dee741/auth/signup`

## 🐛 Troubleshooting

### Common Issues:

1. **"Function not found" (404)**
   - Function isn't deployed
   - Function name is wrong (must be exactly `make-server-e5dee741`)

2. **"Internal server error" (500)**
   - Missing environment variables
   - Code error in the function

3. **CORS errors**
   - Add your domain to the CORS configuration in the function

4. **Authentication errors**
   - Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Debug Steps:

1. Use the **Server Deployment Checker** tool in the app
2. Check Supabase Edge Function logs in the dashboard
3. Test each endpoint individually
4. Verify environment variables are set

## 📋 Your Project Details

- **Project ID:** `tnnaitaovinhtgoqtuvs`
- **Server URL:** `https://tnnaitaovinhtgoqtuvs.supabase.co/functions/v1/make-server-e5dee741`
- **Health Check:** `https://tnnaitaovinhtgoqtuvs.supabase.co/functions/v1/make-server-e5dee741/health`

## 🎯 After Deployment

Once deployed:
1. Test signup should work immediately
2. All authentication features will be available
3. The "Server not available" error will be resolved

Need help? Use the **Server Deployment Checker** tool in your app at `/?page=database-setup`