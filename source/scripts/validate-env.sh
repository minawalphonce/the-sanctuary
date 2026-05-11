#!/bin/bash
# =============================================================================
# validate-env.sh
# Checks that all required environment variables are present in .env
# before attempting a build or deploy.
#
# Usage:
#   ./docs/scripts/validate-env.sh
# =============================================================================

ENV_FILE=".env"
ERRORS=0

if [ ! -f "$ENV_FILE" ]; then
  echo "❌  .env file not found."
  echo "    Run: cp docs/config/.env.example .env"
  echo "    Then fill in all the values."
  exit 1
fi

# Load the .env file
export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

check_var() {
  local VAR_NAME=$1
  local VALUE="${!VAR_NAME}"

  if [ -z "$VALUE" ] || [ "$VALUE" = "REPLACE_ME" ]; then
    echo "❌  Missing: $VAR_NAME"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅  $VAR_NAME"
  fi
}

echo ""
echo "Checking required environment variables..."
echo ""

check_var "VITE_FIREBASE_API_KEY"
check_var "VITE_FIREBASE_AUTH_DOMAIN"
check_var "VITE_FIREBASE_PROJECT_ID"
check_var "VITE_FIREBASE_STORAGE_BUCKET"
check_var "VITE_FIREBASE_MESSAGING_SENDER_ID"
check_var "VITE_FIREBASE_APP_ID"
check_var "VITE_SHEET_ID"
check_var "VITE_ORG_NAME"

echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌  $ERRORS variable(s) missing. Fill them in .env before deploying."
  exit 1
else
  echo "✅  All required variables are set."
fi
