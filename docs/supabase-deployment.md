# Supabase Edge Functions Deployment Guide

## Prerequisites

Before deploying, you'll need:
1. **Supabase CLI** installed on your local machine
2. **Supabase project** already created (you have the Project ID and Anon Key configured)
3. **Supabase access token** for authentication

## Step 1: Install Supabase CLI

If you haven't installed the Supabase CLI yet, install it:

### On macOS/Linux:
```bash
brew install supabase/tap/supabase
```

### On Windows:
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Alternative (NPM):
```bash
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate. Follow the prompts to log in.

## Step 3: Link Your Project

You need to link the Supabase CLI to your project. Use your project's reference ID (from the Project Settings in Supabase Dashboard):

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in your Supabase dashboard under Project Settings).

## Step 4: Prepare the Edge Function

The Edge Function code is located at:
```
src/supabase/functions/server/index.tsx
```

However, Supabase expects functions to be in a specific directory structure. You need to:

1. Create a `supabase/functions` directory in your project root:
```bash
mkdir -p supabase/functions/make-server-41a1615d
```

2. Copy the function code:
```bash
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-41a1615d/index.ts
```

3. Create a `deno.json` configuration file in the function directory:
```bash
cat > supabase/functions/make-server-41a1615d/deno.json << 'EOF'
{
  "imports": {
    "hono": "https://deno.land/x/hono@v3.11.7/mod.ts"
  }
}
EOF
```

## Step 5: Deploy the Edge Function

Deploy the function to Supabase:

```bash
supabase functions deploy make-server-41a1615d
```

This command will:
- Upload your function code to Supabase
- Deploy it to the edge network
- Make it available at: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-41a1615d`

## Step 6: Set Environment Variables (if needed)

If your function needs environment variables, set them:

```bash
supabase secrets set SECRET_NAME=secret_value
```

## Step 7: Verify Deployment

Test that your function is working:

```bash
curl -i https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-41a1615d/health
```

You should get a response confirming the function is running.

## Troubleshooting

### Error: "Function not found"
- Make sure you've completed the link step correctly
- Verify your project ID is correct

### Error: "Permission denied"
- Re-run `supabase login` to refresh your authentication
- Check that your Supabase account has permissions to deploy functions

### Error: "Import errors" or "Module not found"
- Check that the `deno.json` file is properly configured
- Ensure all imports in your function code use valid Deno-compatible URLs

### Edge Function fails to start
- Check the Supabase dashboard Logs section for detailed error messages
- Verify the function code doesn't have syntax errors

## Quick Deploy Script

For convenience, here's a complete deployment script:

```bash
#!/bin/bash

# Configuration
PROJECT_ID="your-project-id-here"
FUNCTION_NAME="make-server-41a1615d"

# Create directories
mkdir -p supabase/functions/$FUNCTION_NAME

# Copy function code
cp src/supabase/functions/server/index.tsx supabase/functions/$FUNCTION_NAME/index.ts

# Create deno.json
cat > supabase/functions/$FUNCTION_NAME/deno.json << 'EOF'
{
  "imports": {
    "hono": "https://deno.land/x/hono@v3.11.7/mod.ts"
  }
}
EOF

# Link project (if not already linked)
supabase link --project-ref $PROJECT_ID

# Deploy
supabase functions deploy $FUNCTION_NAME

echo "Deployment complete! Your function is available at:"
echo "https://$PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
```

Save this as `deploy-functions.sh`, make it executable (`chmod +x deploy-functions.sh`), update the PROJECT_ID, and run it.

## Alternative: Deploy from Replit

If you want to deploy directly from Replit without installing the Supabase CLI locally:

1. Open the Replit Shell
2. Install Supabase CLI in the shell:
   ```bash
   curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz && mv supabase /usr/local/bin/
   ```
3. Follow steps 2-7 above from the Replit shell

## Next Steps

After deployment:
1. Your VillaSaya app should now be able to create villas and use all backend features
2. Monitor your function logs in the Supabase Dashboard under "Edge Functions"
3. Consider setting up CORS if you encounter cross-origin issues

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/functions
- VillaSaya GitHub Issues: Report deployment issues
- Supabase Discord: https://discord.supabase.com
