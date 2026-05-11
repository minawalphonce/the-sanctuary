# Runbook: Troubleshooting

Common issues and how to fix them.

---

## Login Issues

### "Access denied" after logging in with Google

**Cause:** The user's email is not in the `admins` tab of the sheet.

**Fix:**
1. Open the Google Sheet → `admins` tab
2. Check if their email is there (exact match, no spaces)
3. If missing, add it
4. Ask them to log out and log back in

---

### Google login popup doesn't open

**Cause A:** Popup blocked by browser.
**Fix:** Tell them to allow popups for this site, or use a different browser.

**Cause B:** The domain is not in Firebase Auth's authorised domains list.
**Fix:**
1. Firebase Console → Authentication → Settings → Authorised domains
2. Add the current domain (e.g. `yourapp.web.app` or custom domain)

---

### "This app is blocked" error from Google

**Cause:** The OAuth consent screen is in "Testing" mode and the user is not a test user.
**Fix A (quick):** Add their email to the test users list in Google Cloud Console → OAuth consent screen.
**Fix B (permanent):** Publish the OAuth consent screen:
1. Google Cloud Console → APIs & Services → OAuth consent screen
2. Click **Publish app**

---

## Sheets API Issues

### Data not loading / "Failed to fetch" error

**Cause A:** The Sheet ID in `.env` is wrong.
**Fix:** Double-check `VITE_SHEET_ID` matches the ID in the sheet URL.

**Cause B:** The Google Sheets API is not enabled for this project.
**Fix:**
1. Google Cloud Console → APIs & Services → Dashboard
2. Look for Google Sheets API in the list
3. If missing → search and enable it

**Cause C:** The sheet is not shared properly.
**Fix:** The sheet must be accessible to the logged-in user's Google account.
Share the sheet with "Anyone with the link can edit" or share it explicitly with the user's email.

---

### Changes made in app don't appear in sheet

**Cause:** The user's OAuth token may not have the Sheets write scope.
**Fix:** Ask them to log out and log back in — the new login will re-request permissions.

---

## Deploy Issues

### `firebase deploy` fails with "project not found"

**Fix:**
```bash
firebase use --list       # see available projects
firebase use PROJECT_ID   # switch to the right one
```

---

### Build fails with "VITE_... is not defined"

**Cause:** `.env` file is missing or incomplete.
**Fix:**
```bash
./docs/scripts/validate-env.sh
```
Fill in any missing values, then try building again.

---

### Deploy succeeds but app shows old version

**Cause:** Browser cache.
**Fix:** Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac).
On mobile: clear the app from recent apps, reopen.

If the PWA is installed on a phone, it may take a few minutes to pick up the new service worker. Or go to Settings → Clear app cache.

---

## FCM / Notifications Not Working

### Notifications not received on iOS

**Cause:** iOS requires the PWA to be installed to the home screen AND iOS 16.4+.
**Fix:** Ask the user to:
1. Open the app in Safari
2. Tap the Share button → **Add to Home Screen**
3. Open the app from the home screen icon
4. Accept the notification permission prompt

---

### Notifications not received on Android

**Cause A:** Permission denied.
**Fix:** Settings → App permissions → Notifications → allow for this site.

**Cause B:** VAPID key mismatch.
**Fix:** Check `VITE_FIREBASE_VAPID_KEY` in `.env` matches the key in Firebase Console → Cloud Messaging → Web Push certificates.

---

## General

### The app works locally but not after deploy

1. Run `validate-env.sh` to check all vars are set
2. Check browser console for errors (F12)
3. Check Firebase Hosting deploy logs: `firebase deploy --debug`
4. Make sure the domain is in Firebase Auth authorised domains

### Something is broken and I don't know why

1. Open the browser developer console (F12 → Console tab)
2. Look for red error messages
3. Search the error text — most Firebase and Sheets API errors are well documented
4. Check Firebase Console → Authentication for auth errors
5. Check Google Cloud Console → APIs & Services → Quotas to see if a rate limit was hit
