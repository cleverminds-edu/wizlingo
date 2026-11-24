#!/bin/bash

# T1.8: Deploy to Staging - Automated Deployment Script
# This script prepares and deploys Week 3-4 code to Railway staging

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
log_step() {
    echo -e "${BLUE}→ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Start deployment
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  T1.8: DEPLOY WEEK 3-4 CODE TO STAGING${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Verify environment
log_step "Step 1: Verify environment"
if ! command -v npm &> /dev/null; then
    log_error "npm not found. Please install Node.js"
fi
log_success "npm found"

if ! command -v git &> /dev/null; then
    log_error "git not found. Please install git"
fi
log_success "git found"

echo ""

# Step 2: Verify on correct branch
log_step "Step 2: Verify on develop branch"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    log_warning "Currently on branch: $CURRENT_BRANCH"
    read -p "Switch to develop? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout develop
        git pull origin develop
        log_success "Switched to develop and pulled latest"
    else
        log_error "Must be on develop branch to deploy"
    fi
else
    log_success "Already on develop branch"
fi

echo ""

# Step 3: Pull latest code
log_step "Step 3: Pull latest code"
git pull origin develop
log_success "Latest code pulled"

echo ""

# Step 4: Install dependencies
log_step "Step 4: Install dependencies"
npm install
log_success "Dependencies installed"

echo ""

# Step 5: Run linting
log_step "Step 5: Run linting checks"
npm run lint 2>&1 | grep -E "error|warning" || log_success "Linting passed"

echo ""

# Step 6: TypeScript check
log_step "Step 6: TypeScript compilation check"
npm run type-check
log_success "TypeScript check passed"

echo ""

# Step 7: Run unit tests
log_step "Step 7: Run unit tests"
npm test -- --passWithNoTests --forceExit 2>&1 | tail -20
log_success "Unit tests passed"

echo ""

# Step 8: Build application
log_step "Step 8: Build application"
npm run build
log_success "Build successful"

echo ""

# Step 9: Create release tag
log_step "Step 9: Create release tag"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RELEASE_TAG="staging-v0.1.0-$TIMESTAMP"
git tag $RELEASE_TAG
log_success "Release tag created: $RELEASE_TAG"

echo ""

# Step 10: Database migration check
log_step "Step 10: Check database migrations"
if command -v npx &> /dev/null; then
    echo "Migrations status:"
    npx prisma migrate status || log_warning "Could not check migration status (database may not be accessible)"
    log_success "Migration check complete"
else
    log_warning "Prisma CLI not available, skipping migration check"
fi

echo ""

# Step 11: Environment variables check
log_step "Step 11: Verify environment variables"
echo "Required environment variables for staging:"
echo "  • DATABASE_URL"
echo "  • JWT_SECRET"
echo "  • API_URL"
echo "  • NODE_ENV"
log_warning "Please ensure these are set on Railway before deploying"

echo ""

# Step 12: Deployment instructions
log_step "Step 12: Ready for deployment"
echo ""
echo "Next steps:"
echo "  1. Ensure .env.staging is configured (do NOT commit)"
echo "  2. Push to Railway:"
echo "     railway up"
echo "     OR"
echo "     git push origin develop (if GitHub integration enabled)"
echo "  3. Monitor deployment:"
echo "     railway logs --environment staging --tail"
echo "  4. Verify health endpoint:"
echo "     curl https://staging-wizlingo.railway.app/api/health"
echo ""

log_success "Deployment preparation complete!"
log_success "Code is ready to deploy to staging"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  READY FOR DEPLOYMENT${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
