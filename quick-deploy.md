# 🚀 Quick Deploy Guide

I've created an automated deployment script for you! Here's what to do:

## Option 1: Fully Automated (Recommended)

### Step 1: Login to Supabase CLI (One-time setup)

Open the **Shell** tab and run:

```bash
npx supabase login
```

A browser window will open. Click **"Authorize"** to allow CLI access.

### Step 2: Run the Deployment Script

```bash
bash deploy.sh
```

This script will automatically:
- ✅ Install Supabase CLI
- ✅ Deploy your Edge Functions
- ✅ Run database migrations
- ✅ Build your app for production

### Step 3: Deploy Frontend on Replit

1. Click the **"Deploy"** button at the top of Replit
2. Select **"Autoscale"** 
3. Click **"Deploy"**

Done! Your app will be live in 2-3 minutes.

---

## Option 2: Manual Steps (If script fails)

If the automated script doesn't work, follow these manual steps:

### 1. Login to Supabase
```bash
npx supabase login
```

### 2. Deploy Edge Functions
```bash
npx supabase functions deploy make-server-41a1615d --project-ref YOUR_PROJECT_ID
```

### 3. Set up Database
Go to https://app.supabase.com → SQL Editor → Run the SQL from `supabase/migrations/001_create_kv_store.sql`

### 4. Build App
```bash
npm run build
```

### 5. Deploy on Replit
Click Deploy → Autoscale → Deploy

---

## Need Help?

If you see any errors, let me know and I'll help you fix them!
