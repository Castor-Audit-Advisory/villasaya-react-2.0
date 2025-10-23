#!/bin/bash

# VillaSaya Edge Functions Deployment Script for Replit
# This script deploys the Supabase Edge Functions using an access token

echo "🚀 VillaSaya Edge Functions Deployment"
echo "========================================"
echo ""

# Set up PATH to include local Supabase CLI
export PATH="$HOME/.local/bin:$(pwd)/supabase_linux_amd64:$PATH"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please ensure it's installed."
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Get project ID
if [ -z "$VITE_SUPABASE_PROJECT_ID" ]; then
    read -p "Enter your Supabase Project ID: " PROJECT_ID
else
    PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
    echo "📋 Using Project ID: $PROJECT_ID"
fi

# Get access token
echo ""
echo "To get your access token:"
echo "1. Go to https://supabase.com/dashboard/account/tokens"
echo "2. Generate a new access token"
echo "3. Copy and paste it below"
echo ""
read -sp "Enter your Supabase Access Token: " ACCESS_TOKEN
echo ""

# Login using access token
echo ""
echo "🔐 Authenticating with Supabase..."
echo "$ACCESS_TOKEN" | supabase login --token "$ACCESS_TOKEN"

if [ $? -ne 0 ]; then
    echo "❌ Failed to authenticate. Please check your access token."
    exit 1
fi

echo "✅ Authentication successful!"
echo ""

# Link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project."
    exit 1
fi

echo "✅ Project linked successfully!"
echo ""

# Deploy function
FUNCTION_NAME="make-server-41a1615d"
echo "🚢 Deploying Edge Function: $FUNCTION_NAME"
echo "This may take a minute..."
echo ""

supabase functions deploy $FUNCTION_NAME --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your VillaSaya backend is now live!"
    echo ""
    echo "Function URL:"
    echo "https://$PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
    echo ""
    echo "You can now:"
    echo "  ✅ Create villas"
    echo "  ✅ Manage expenses"
    echo "  ✅ Track tasks"
    echo "  ✅ Use all VillaSaya features"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Check error messages above."
    echo ""
    echo "Common issues:"
    echo "  - Invalid access token"
    echo "  - Wrong project ID"
    echo "  - Network connectivity"
    echo ""
    echo "For detailed help, see: docs/supabase-deployment.md"
    exit 1
fi
