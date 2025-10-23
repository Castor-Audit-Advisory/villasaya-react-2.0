#!/bin/bash
# VillaSaya Automated Deployment Script

set -e  # Exit on any error

echo "🚀 VillaSaya Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase project ID is set
if [ -z "$VITE_SUPABASE_PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: VITE_SUPABASE_PROJECT_ID not found in environment${NC}"
    echo "Please make sure you've added your Supabase credentials to Replit Secrets"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables verified${NC}"
echo "   Project ID: ${VITE_SUPABASE_PROJECT_ID:0:8}..."
echo ""

# Step 1: Check if logged in to Supabase
echo -e "${BLUE}🔐 Step 1: Checking Supabase authentication...${NC}"
if npx supabase projects list &> /dev/null; then
    echo -e "${GREEN}✅ Already logged in to Supabase${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo ""
    echo -e "${YELLOW}ACTION REQUIRED - PLEASE DO THIS MANUALLY:${NC}"
    echo "1. Run this command in Shell: ${BLUE}npx supabase login${NC}"
    echo "2. A browser window will open - click 'Authorize'"
    echo "3. Then run this script again: ${BLUE}bash deploy.sh${NC}"
    echo ""
    exit 1
fi
echo ""

# Step 2: Deploy Edge Functions
echo -e "${BLUE}⚡ Step 2: Deploying Edge Functions to Supabase...${NC}"
echo "Deploying make-server-41a1615d to project $VITE_SUPABASE_PROJECT_ID..."

if npx supabase functions deploy make-server-41a1615d --project-ref "$VITE_SUPABASE_PROJECT_ID" --no-verify-jwt; then
    echo -e "${GREEN}✅ Edge Functions deployed successfully${NC}"
else
    echo -e "${RED}❌ Edge Functions deployment failed${NC}"
    echo "Please check the error above and try again"
    exit 1
fi
echo ""

# Step 3: Deploy database migration
echo -e "${BLUE}🗄️  Step 3: Deploying database migration...${NC}"
if [ -f "supabase/migrations/001_create_kv_store.sql" ]; then
    echo "Migration file found. Attempting to deploy..."
    
    # Try to push migrations
    if npx supabase db push --project-ref "$VITE_SUPABASE_PROJECT_ID" 2>&1; then
        echo -e "${GREEN}✅ Database migration deployed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Database migration command failed (this might be okay)${NC}"
        echo ""
        echo -e "${YELLOW}Please verify database setup manually:${NC}"
        echo "1. Go to: https://app.supabase.com/project/$VITE_SUPABASE_PROJECT_ID/sql/new"
        echo "2. Copy contents of: supabase/migrations/001_create_kv_store.sql"
        echo "3. Paste and click 'RUN'"
        echo ""
        echo "Press Enter to continue with build..."
        read
    fi
else
    echo -e "${RED}❌ Migration file not found${NC}"
    exit 1
fi
echo ""

# Step 4: Build the application
echo -e "${BLUE}🔨 Step 4: Building application for production...${NC}"
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Production build created successfully${NC}"
    echo "   Build output: $(du -sh dist | cut -f1)"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Final instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Backend Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Final Step - Deploy Frontend:${NC}"
echo "1. Look for the ${BLUE}'Deploy'${NC} or ${BLUE}'Publish'${NC} button at the top"
echo "2. Click it and select ${BLUE}'Autoscale'${NC} deployment"
echo "3. Configuration is already set:"
echo "   - Build: npm run build ✅"
echo "   - Run: npm run preview ✅"
echo "4. Click ${BLUE}'Deploy'${NC} and wait 2-3 minutes"
echo ""
echo -e "${GREEN}🚀 Your app will be live soon!${NC}"
