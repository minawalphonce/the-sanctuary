#!/bin/bash
# =============================================================================
# deploy.sh
# Validates environment, builds the app, and deploys to Firebase Hosting.
#
# Usage (from anywhere in the repo):
#   source/scripts/deploy.sh
# =============================================================================

set -e

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPTS_DIR")"
APP_DIR="$SOURCE_DIR/app"

echo ""
echo "🚀  Deploying to Firebase Hosting"
echo ""

# --- Step 1: Validate environment ---
echo "🔍  Step 1/4 — Validating environment variables..."
(cd "$APP_DIR" && "$SCRIPTS_DIR/validate-env.sh")
echo "✅  Environment OK"

# --- Step 2: Install dependencies ---
echo ""
echo "📦  Step 2/4 — Installing dependencies..."
(cd "$APP_DIR" && npm ci --silent)
echo "✅  Dependencies installed"

# --- Step 3: Build ---
echo ""
echo "🔨  Step 3/4 — Building..."
(cd "$APP_DIR" && npm run build)
echo "✅  Build complete"

# --- Step 4: Deploy ---
echo ""
echo "📡  Step 4/4 — Deploying to Firebase..."
(cd "$SOURCE_DIR" && firebase deploy --only hosting)
echo ""
echo "✅  Deployment complete!"
echo ""
