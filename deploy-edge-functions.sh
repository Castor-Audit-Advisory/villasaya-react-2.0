#!/bin/bash

set -euo pipefail

FUNCTION_NAME="make-server-41a1615d"

if ! command -v supabase >/dev/null 2>&1; then
  echo "❌ Supabase CLI is not installed. Install it with 'npm install -g supabase'."
  exit 1
fi

echo "🚀 VillaSaya Edge Function Deployment"

echo "────────────────────────────────────────"

if [[ -z "${VITE_SUPABASE_PROJECT_ID:-}" ]]; then
  read -rp "Enter your Supabase project ID: " PROJECT_ID
else
  PROJECT_ID="$VITE_SUPABASE_PROJECT_ID"
  echo "Using project ID from environment: $PROJECT_ID"
fi

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  read -rsp "Enter your Supabase service role key: " SUPABASE_SERVICE_ROLE_KEY
  echo ""
fi

if [[ -z "${SUPABASE_ANON_KEY:-}" ]]; then
  read -rsp "Enter your Supabase anon key: " SUPABASE_ANON_KEY
  echo ""
fi

echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_ID"

echo "🚢 Deploying Edge Function ($FUNCTION_NAME)..."
supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_ID" --no-verify-jwt

echo "🔐 Syncing required secrets..."
supabase secrets set \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  --project-ref "$PROJECT_ID"

echo "✅ Deployment complete"
echo "→ API URL: https://$PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
