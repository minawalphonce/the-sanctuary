# Firebase Console — Manual Steps

These are the manual clicks inside the Firebase Console that cannot be scripted.
Screenshots can't be included here — use this as a written guide alongside the console.

---

## Create a New Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Enter a project name — use lowercase with hyphens: `orgname-youth-app`
   - This becomes your project ID — choose carefully, it cannot be changed
4. **Disable** Google Analytics unless you specifically need it
5. Click **Create project** — wait ~30 seconds
6. Click **Continue**

---

## Enable Google Authentication

1. In the left sidebar → **Build** → **Authentication**
2. Click **Get started**
3. Click the **Sign-in method** tab
4. Click **Google** in the provider list
5. Toggle **Enable** to on
6. Set **Project support email** to your email
7. Click **Save**

### Add Authorised Domains

Still in Authentication → **Settings** tab → **Authorised domains**

By default `localhost` and `your-project.firebaseapp.com` are there.

After deploying (Step 5 of NEW_INSTANCE.md):
- Click **Add domain**
- Add your Firebase Hosting URL: `your-project.web.app`
- If using a custom domain, add that too

---

## Get Your Web App Config

1. In the left sidebar → **Project Overview** (the gear icon) → **Project settings**
2. Scroll down to **Your apps**
3. If no app exists → click the `</>` web icon to register a new web app
   - Give it a nickname: `Youth Admin PWA`
   - Check **Also set up Firebase Hosting** to link them
   - Click **Register app**
4. Copy the `firebaseConfig` object values into your local `.env` file (for local dev only — on Firebase Hosting these are injected automatically via `/__/firebase/init.json`):

```
apiKey            → VITE_FIREBASE_API_KEY
authDomain        → VITE_FIREBASE_AUTH_DOMAIN
projectId         → VITE_FIREBASE_PROJECT_ID
storageBucket     → VITE_FIREBASE_STORAGE_BUCKET
messagingSenderId → VITE_FIREBASE_MESSAGING_SENDER_ID
appId             → VITE_FIREBASE_APP_ID
```

> **Note:** You only need `.env` for `vite dev`. Deployed builds on Firebase Hosting fetch config automatically — no env vars required.

---

## Enable Firebase Hosting

1. In the left sidebar → **Build** → **Hosting**
2. Click **Get started**
3. The wizard shows CLI commands — you don't need to run them now if using `deploy.sh`
4. Click through to finish — the hosting site is now created
5. Note your default URL: `your-project-id.web.app`

---

## Enable Firebase Cloud Messaging (FCM) — Optional

1. In the left sidebar → **Build** → **Cloud Messaging**
2. Click **Get started** if prompted
3. Go to **Web configuration** tab
4. Under **Web Push certificates** → click **Generate key pair**
5. Copy the key → add to `.env` as `VITE_FIREBASE_VAPID_KEY`

---

## Billing — Stay on Free Tier

1. In the left sidebar → **Spark plan** label at the bottom
2. Make sure it says **Spark (free)** — do not upgrade unless needed
3. Firebase Hosting free tier: 10 GB storage, 360 MB/day transfer — more than enough
4. Firebase Auth free tier: unlimited — no limits for Google Sign-In
