# VillaSaya Deployment Guide

This guide walks you through deploying VillaSaya to production.

## Pre-Deployment Checklist

### 1. Environment Configuration

Ensure all required environment variables are set:

```env
# Required in Production
VITE_SUPABASE_PROJECT_ID=your_production_project_id
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Security
ENABLE_DEV_ENDPOINTS=false  # MUST be false or removed in production
NODE_ENV=production
```

### 2. Database Setup

Run all migrations on your production Supabase instance:

```bash
# Option 1: Using Supabase CLI
npx supabase db push

# Option 2: Manual SQL execution
# Go to Supabase Dashboard → SQL Editor
# Run: supabase/migrations/001_create_kv_store.sql
```

**Verify tables exist:**
- `kv_store_41a1615d` - Key-value store for application state

### 3. Edge Functions Deployment

Deploy backend API to Supabase:

```bash
# Set your production project ID
export VITE_SUPABASE_PROJECT_ID=your_production_project_id

# Deploy the Edge Function
npx supabase functions deploy make-server-41a1615d

# Verify required secrets exist (set them if they are missing)
supabase secrets list
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key SUPABASE_ANON_KEY=your_anon_key

# Verify deployment
npx supabase functions list
```

**Important**: The Edge Function validates `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` on every request. If any secret is missing the API will fail fast instead of silently targeting `https://.supabase.co`.

### 4. Security Checklist

- [ ] `ENABLE_DEV_ENDPOINTS` is set to `false` or removed
- [ ] All secrets are stored in environment variables (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] Supabase Row Level Security (RLS) policies are enabled
- [ ] Service role key is NEVER exposed to frontend
- [ ] CORS settings are configured properly in Edge Functions

### 5. Build & Test

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Test the production build locally
npm run preview
```

## Deployment Platforms

### Deploy to Replit (Recommended)

1. **Import Repository**
   - Go to Replit and import this repository
   - Replit will auto-detect the configuration

2. **Set Environment Variables**
   - Navigate to "Secrets" (lock icon in sidebar)
   - Add:
     - `VITE_SUPABASE_PROJECT_ID`
     - `VITE_SUPABASE_ANON_KEY`
     - `ENABLE_DEV_ENDPOINTS=false`

3. **Deploy**
   - Click "Deploy" button
   - Select "Autoscale" deployment type
   - Configure custom domain (optional)

4. **Verify**
   - Test authentication flow
   - Test file uploads
   - Verify all features work on mobile

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Project**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_PROJECT_ID production
   vercel env add VITE_SUPABASE_ANON_KEY production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_ANON_KEY`

### Deploy to Static Hosting (S3, GCS, etc.)

1. **Build**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your hosting platform

3. **Configure** environment variables through your hosting platform's interface

## Post-Deployment Verification

### 1. Smoke Tests

- [ ] App loads without errors
- [ ] Login/signup works
- [ ] Dashboard displays correctly
- [ ] Can create/view tasks
- [ ] Can submit/approve expenses
- [ ] Can send/receive messages
- [ ] Staff can clock in/out
- [ ] Calendar events work
- [ ] File uploads work
- [ ] Mobile responsive design works

### 2. Performance Checks

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors in production

### 3. Security Audit

- [ ] `/seed-test-users` endpoint returns 403
- [ ] No API keys visible in browser dev tools
- [ ] HTTPS is enforced
- [ ] CSP headers are set

## Monitoring & Maintenance

### Supabase Dashboard

Monitor your app at:
- **Logs**: `https://app.supabase.com/project/YOUR_PROJECT_ID/logs/explorer`
- **Auth Users**: `https://app.supabase.com/project/YOUR_PROJECT_ID/auth/users`
- **Database**: `https://app.supabase.com/project/YOUR_PROJECT_ID/database/tables`
- **Edge Functions**: `https://app.supabase.com/project/YOUR_PROJECT_ID/functions`

### Key Metrics to Monitor

1. **Authentication**
   - Failed login attempts
   - User growth rate
   - Session duration

2. **Database**
   - Query performance
   - Storage usage
   - Connection count

3. **Edge Functions**
   - Invocation count
   - Error rate
   - Execution time

4. **Frontend**
   - Error rate (via error boundary)
   - Page load times
   - User engagement

## Troubleshooting

### Issue: "Failed to fetch" errors in production

**Solutions:**
1. Verify Supabase project ID is correct
2. Check anon key matches your project
3. Ensure Edge Functions are deployed
4. Verify CORS settings in Edge Functions

### Issue: Authentication not working

**Solutions:**
1. Check email confirmation settings in Supabase Auth
2. Verify redirect URLs are configured
3. Ensure anon key has correct permissions
4. Check browser console for specific errors

### Issue: File uploads failing

**Solutions:**
1. Verify Storage bucket exists and is public
2. Check RLS policies on Storage
3. Ensure file size limits are not exceeded
4. Check CORS configuration in Storage settings

### Issue: Dev endpoints accessible in production

**Solutions:**
1. Verify `ENABLE_DEV_ENDPOINTS=false` is set
2. Redeploy Edge Functions with updated env vars
3. Clear Edge Function cache: `npx supabase functions deploy --no-verify-jwt`

## Rollback Procedure

If you need to rollback a deployment:

1. **Identify the issue** using monitoring dashboards

2. **Rollback frontend:**
   - Replit: Click "History" and restore previous deployment
   - Vercel: `vercel rollback <deployment-url>`
   - Netlify: Netlify Dashboard → Deploys → Restore

3. **Rollback Edge Functions:**
   ```bash
   # Deploy previous version
   git checkout <previous-commit>
   npx supabase functions deploy make-server-41a1615d
   ```

4. **Rollback database** (if needed):
   - Use Supabase Point-in-Time Recovery
   - Or restore from backup

## Scaling Considerations

### Database
- Monitor query performance
- Add indexes for frequently queried columns
- Consider read replicas for high traffic

### Edge Functions
- Supabase Edge Functions auto-scale
- Monitor cold start times
- Optimize function code for performance

### Frontend
- Enable CDN caching
- Optimize images (use WebP, lazy loading)
- Code splitting for faster initial loads

## Support

For deployment issues:
1. Check Supabase status: https://status.supabase.com
2. Review Supabase logs in dashboard
3. Contact Supabase support for platform issues
4. Create an issue in the repository for app-specific bugs

---

**Last Updated**: October 2025
