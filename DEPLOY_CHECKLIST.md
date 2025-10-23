# 🚀 VillaSaya Deployment Checklist

Follow these steps to deploy VillaSaya to production on Replit.

## ✅ Pre-Deployment (COMPLETED)

- [x] Production build tested and working
- [x] Zero LSP errors
- [x] All TODOs resolved
- [x] Documentation complete
- [x] Security hardening applied
- [x] Deployment configuration set

## 📋 Step-by-Step Deployment Guide

### Step 1: Set Environment Variables in Replit

1. **Click the lock icon (🔒) in the left sidebar** to open Replit Secrets
2. **Add these secrets** (one at a time):

   ```
   Secret Name: VITE_SUPABASE_PROJECT_ID
   Value: [your_supabase_project_id]
   ```

   ```
   Secret Name: VITE_SUPABASE_ANON_KEY
   Value: [your_supabase_anon_key]
   ```

   ```
   Secret Name: ENABLE_DEV_ENDPOINTS
   Value: false
   ```

   ```
   Secret Name: NODE_ENV
   Value: production
   ```

**Where to find Supabase credentials:**
- Go to https://app.supabase.com
- Select your project
- Navigate to **Settings → API**
- Copy:
  - **Project ID**: From the project URL or settings
  - **Anon/Public Key**: The `anon` `public` key

### Step 2: Deploy Supabase Edge Functions

Open the Shell in Replit and run:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Deploy the Edge Function
npx supabase functions deploy make-server-41a1615d --project-ref [YOUR_PROJECT_ID]

# Configure required secrets (run once per project)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY] SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID.

### Step 3: Run Database Migration

In Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_create_kv_store.sql`
4. Paste and click **Run**

Or use CLI:

```bash
npx supabase db push --project-ref [YOUR_PROJECT_ID]
```

### Step 4: Test the Build Locally

In Replit Shell:

```bash
npm run build
npm run preview
```

Visit the preview URL to verify everything works.

### Step 5: Deploy on Replit

1. **Click the "Deploy" button** at the top of your Replit workspace
2. **Choose "Autoscale"** deployment type (recommended for web apps)
3. **Configure settings:**
   - Build command: `npm run build`
   - Run command: `npm run preview`
   - These are already configured automatically!
4. **Click "Deploy"**

### Step 6: Verify Production Deployment

Once deployed, test these critical features:

- [ ] Login/signup works
- [ ] Dashboard loads correctly
- [ ] Can create tasks
- [ ] Can submit expenses
- [ ] Can send messages
- [ ] Staff clock in/out works
- [ ] Calendar events work
- [ ] File uploads work
- [ ] Mobile responsive design works

### Step 7: Security Verification

Test that dev endpoints are disabled:

```bash
curl -X POST https://[your-deployment-url].repl.co/api/make-server-41a1615d/seed-test-users
```

**Expected response:** `403 Forbidden` with error message about endpoint being disabled in production.

## 🎉 Post-Deployment

### Optional: Configure Custom Domain

1. In Replit Deploy dashboard, click **"Domains"**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (usually 5-30 minutes)

### Monitor Your Deployment

- **Replit Dashboard**: View logs, metrics, and usage
- **Supabase Dashboard**: Monitor database queries and API usage
- **Edge Functions Logs**: Check for any errors in function invocations

## 🆘 Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:**
- Verify environment variables are set correctly in Replit Secrets
- Check that Edge Functions are deployed
- Ensure database migration was run successfully

### Issue: Authentication not working

**Solution:**
- Verify Supabase credentials in Replit Secrets
- Check that anon key is correct
- Ensure redirect URLs are configured in Supabase Auth settings

### Issue: Build fails

**Solution:**
- Check build logs for specific errors
- Verify all dependencies are installed
- Clear cache and rebuild: `rm -rf node_modules dist && npm install && npm run build`

## 📞 Support

- Replit Support: https://replit.com/support
- Supabase Support: https://supabase.com/support
- Project Issues: Create an issue in the repository

---

**Status:** Ready to deploy! Follow the steps above.
