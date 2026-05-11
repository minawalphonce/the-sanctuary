#!/bin/bash
# =============================================================================
# deploy.sh
# Validates environment, builds the app, and deploys to Firebase Hosting.
#
# Usage:
#   ./docs/scripts/deploy.sh
#
# Run from the root of the project (not from inside docs/scripts/)
# =============================================================================

set -e

echo ""
echo "🚀  Deploying to Firebase Hosting"
echo ""

# --- Step 1: Validate environment ---
echo "🔍  Step 1/4 — Validating environment variables..."
./docs/scripts/validate-env.sh
echo "✅  Environment OK"

# --- Step 2: Install dependencies ---
echo ""
echo "📦  Step 2/4 — Installing dependencies..."
npm ci --silent
echo "✅  Dependencies installed"

# --- Step 3: Build ---
echo ""
echo "🔨  Step 3/4 — Building..."
npm run build
echo "✅  Build complete"

# --- Step 4: Deploy ---
echo ""
echo "📡  Step 4/4 — Deploying to Firebase..."
firebase deploy --only hosting
echo ""
echo "✅  Deployment complete!"
echo ""
