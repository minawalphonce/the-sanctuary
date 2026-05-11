#!/bin/bash
# =============================================================================
# create-instance.sh
# Automates Firebase project creation for a new instance of the app.
#
# Usage:
#   ./create-instance.sh <project-id> "<Display Name>"
#
# Example:
#   ./create-instance.sh stmark-youth-app "St Mark Youth"
#
# Prerequisites:
#   - firebase-tools installed: npm install -g firebase-tools
#   - gcloud CLI installed: https://cloud.google.com/sdk/docs/install
#   - Logged in: firebase login && gcloud auth login
# =============================================================================

set -e  # Exit immediately on any error

PROJECT_ID=$1
DISPLAY_NAME=$2

# --- Validate inputs ---
if [ -z "$PROJECT_ID" ] || [ -z "$DISPLAY_NAME" ]; then
  echo "❌  Usage: ./create-instance.sh <project-id> \"<Display Name>\""
  echo "    Example: ./create-instance.sh stmark-youth-app \"St Mark Youth\""
  exit 1
fi

if [[ ! "$PROJECT_ID" =~ ^[a-z][a-z0-9-]{5,29}$ ]]; then
  echo "❌  Project ID must be lowercase letters, numbers, and hyphens only (6-30 chars)"
  exit 1
fi

echo ""
echo "🚀  Creating new Firebase instance"
echo "    Project ID:   $PROJECT_ID"
echo "    Display Name: $DISPLAY_NAME"
echo ""

# --- Step 1: Create Google Cloud / Firebase project ---
echo "📁  Step 1/6 — Creating Firebase project..."
if firebase projects:list | grep -q "$PROJECT_ID"; then
  echo "⚠️   Project $PROJECT_ID already exists — skipping creation"
else
  firebase projects:create "$PROJECT_ID" --display-name "$DISPLAY_NAME"
  echo "✅  Project created"
fi

# --- Step 2: Set as active project ---
echo ""
echo "🔧  Step 2/6 — Setting active project..."
if [ ! -f ".firebaserc" ]; then
  echo "{\"projects\":{\"default\":\"$PROJECT_ID\"}}" > .firebaserc
fi
if [ ! -f "firebase.json" ]; then
  cat > firebase.json <<'EOF'
{
  "hosting": {
    "public": "app/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
EOF
fi
firebase use "$PROJECT_ID"
echo "✅  Active project set to $PROJECT_ID"

# --- Step 3: Enable required Google APIs ---
echo ""
echo "🔌  Step 3/6 — Enabling Google Sheets API..."
gcloud services enable sheets.googleapis.com --project="$PROJECT_ID"
echo "✅  Google Sheets API enabled"

# --- Step 4: Deploy Firebase Hosting config ---
echo ""
echo "🌐  Step 4/6 — Initialising Firebase Hosting..."
firebase deploy --only hosting --project "$PROJECT_ID" 2>/dev/null || \
  echo "⚠️   Hosting deploy skipped (no build output yet — run deploy.sh after setting up .env)"

# --- Step 5: Deploy security rules ---
echo ""
echo "🔒  Step 5/6 — Deploying security rules..."
if [ -f "../config/firebase.rules" ]; then
  cp ../config/firebase.rules ./storage.rules
  firebase deploy --only storage --project "$PROJECT_ID" 2>/dev/null || \
    echo "⚠️   Rules deploy skipped (Storage may not be enabled — enable in console if needed)"
else
  echo "⚠️   No firebase.rules found in config/ — skipping"
fi

# --- Step 6: Print next steps ---
echo ""
echo "✅  Step 6/6 — Done!"
echo ""
echo "============================================"
echo "  Next steps (manual — cannot be scripted):"
echo "============================================"
echo ""
echo "  1. Enable Google Auth:"
echo "     https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo ""
echo "  2. Configure OAuth Consent Screen:"
echo "     https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo ""
echo "  3. Copy and fill in your .env file:"
echo "     cp docs/config/.env.example .env"
echo "     (Get values from Firebase Console → Project Settings → Your apps)"
echo ""
echo "  4. Build and deploy:"
echo "     ./docs/scripts/deploy.sh"
echo ""
echo "  Full guide: docs/setup/NEW_INSTANCE.md"
echo ""
