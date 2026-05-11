# New Instance Setup Checklist

Use this document every time you deploy the app for a new organisation.
Complete steps in order — some steps depend on earlier ones.

Estimated time: **45–60 minutes** (most of it waiting for Google to propagate things)

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install
- [ ] You are logged in: `firebase login` and `gcloud auth login`
- [ ] You have the source code repo cloned locally

---

## Step 1 — Google Sheet

- [ ] Make a copy of the master sheet template (see `architecture/google-sheets-structure.md`)
- [ ] Rename it to the organisation name, e.g. `St Mark Youth - App Data`
- [ ] Move it to the organisation's Google Drive folder
- [ ] Share it with anyone who should have fallback access
- [ ] Note the **Sheet ID** from the URL — you will need it in Step 4

---

## Step 2 — Firebase Project

Run the automated script or follow these manual steps.

**Automated (recommended):**
```bash
cd docs/scripts
chmod +x create-instance.sh
./create-instance.sh YOUR-PROJECT-ID "Display Name"
```

**Manual steps** (if script fails — see `firebase-console-steps.md` for screenshots):
- [ ] Go to https://console.firebase.google.com
- [ ] Create new project (use a clear name like `stmark-youth-app`)
- [ ] Disable Google Analytics (not needed)
- [ ] Wait for project to be created

---

## Step 3 — Firebase Auth

- [ ] In Firebase Console → Authentication → Get Started
- [ ] Enable **Google** as a sign-in provider
- [ ] Set project support email
- [ ] Note the **Web Client ID** — you will need it in Step 4
- [ ] Add your hosting domain to authorised domains (do this again after Step 5)

Full steps with screenshots: [`firebase-console-steps.md`](firebase-console-steps.md)

---

## Step 4 — Google Cloud (Sheets API)

- [ ] Go to https://console.cloud.google.com → select the same project
- [ ] Enable **Google Sheets API**
- [ ] Configure **OAuth Consent Screen**
- [ ] Add `../auth/spreadsheets` scope

Full steps: [`google-cloud-steps.md`](google-cloud-steps.md)

---

## Step 5 — Firebase Hosting

- [ ] In Firebase Console → Hosting → Get Started
- [ ] Follow the setup wizard (you will run `firebase init` in the next step)

---

## Step 6 — Environment File (local dev only)

The deployed app on Firebase Hosting loads its Firebase config automatically from `/__/firebase/init.json` — no env file needed for production.

The `.env` file is only required to run `vite dev` locally.

```bash
cp docs/config/.env.example source/app/.env
```

Fill in the values for local development:

```
VITE_FIREBASE_API_KEY=          ← Firebase Console → Project Settings → Your apps
VITE_FIREBASE_AUTH_DOMAIN=      ← your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=       ← your-project-id
VITE_FIREBASE_STORAGE_BUCKET=   ← your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=   ← optional, leave blank if not using Analytics
VITE_SHEET_ID=                  ← from Step 1
VITE_ORG_NAME=                  ← display name e.g. "St Mark Youth"
```

- [ ] All values filled in
- [ ] No trailing spaces
- [ ] `source/app/.env` is in `.gitignore` — **never commit this file**

---

## Step 7 — First Deploy

```bash
# Validate env first
chmod +x docs/scripts/validate-env.sh
./docs/scripts/validate-env.sh

# Build and deploy
chmod +x docs/scripts/deploy.sh
./docs/scripts/deploy.sh
```

- [ ] Build succeeds with no errors
- [ ] Deploy completes — note the hosting URL printed at the end

---

## Step 8 — Post-Deploy Checks

- [ ] Open the app URL in Chrome on a phone
- [ ] Click Login — Google sign-in popup appears
- [ ] Log in with a Google account
- [ ] If email is not in the `admins` tab of the sheet → access denied (correct)
- [ ] Add your email to the `admins` tab in the sheet
- [ ] Log in again → access granted
- [ ] Navigate all sections — no console errors
- [ ] Add a test member → row appears in the sheet
- [ ] Delete the test member

---

## Step 9 — FCM (Push Notifications) — Optional

- [ ] In Firebase Console → Cloud Messaging → Get Started
- [ ] Generate VAPID key pair
- [ ] Add `VITE_FIREBASE_VAPID_KEY` to `.env`
- [ ] Redeploy

---

## Step 10 — Custom Domain — Optional

- [ ] Firebase Console → Hosting → Add custom domain
- [ ] Follow DNS verification steps
- [ ] Update authorised domains in Firebase Auth

---

## Done

- [ ] Share the app URL with the organisation
- [ ] Add all admin emails to the `admins` tab in the sheet
- [ ] Store the `.env` file somewhere safe (NOT in the repo) — a password manager or the organisation's secure shared drive
- [ ] Fill in `runbooks/transfer-ownership.md` with org-specific details
