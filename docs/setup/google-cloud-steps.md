# Google Cloud Console — Manual Steps

Firebase runs on Google Cloud. The Sheets API and OAuth consent screen are
configured here, not in the Firebase Console.

---

## Enable Google Sheets API

1. Go to https://console.cloud.google.com
2. Make sure the correct project is selected in the top dropdown
   - It should match your Firebase project ID
3. In the search bar at the top, type **Google Sheets API**
4. Click the result under "Marketplace"
5. Click **Enable**
6. Wait for it to activate (~10 seconds)

---

## Configure OAuth Consent Screen

This is required before Google Sign-In will work for real users.

1. In the left sidebar → **APIs & Services** → **OAuth consent screen**
2. Choose **External** → click **Create**
   - (Internal is only for Google Workspace organisations)
3. Fill in the required fields:
   - **App name**: the name users will see, e.g. `St Mark Youth Admin`
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue**

### Add Scopes

5. On the Scopes page → click **Add or remove scopes**
6. In the filter box, search for **Google Sheets API**
7. Check the scope: `../auth/spreadsheets`
   - This allows the app to read and write the sheet on behalf of the logged-in user
8. Also add: `../auth/userinfo.email` and `../auth/userinfo.profile`
   - These are usually already included by default
9. Click **Update** → **Save and Continue**

### Test Users (During Development Only)

10. On the Test users page → click **Add users**
11. Add the Google email addresses of anyone who should be able to test
12. Click **Save and Continue**

> **Note:** While the app is in "Testing" status, only test users can log in.
> To open it to all users:
> - Go back to OAuth consent screen
> - Click **Publish app**
> - You may be asked to verify the app — for internal org tools this is usually not required

---

## Verify Everything Is Connected

1. Go to **APIs & Services** → **Dashboard**
2. You should see **Google Sheets API** in the enabled APIs list
3. Go to **Credentials** — you should see an OAuth 2.0 client created by Firebase Auth automatically

If no OAuth client exists:
1. **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Add to Authorised JavaScript origins:
   - `http://localhost:5173` (for local dev)
   - `https://your-project-id.web.app`
4. Click **Create**
5. Copy the **Client ID** — this may be needed in your app config

---

## Notes

- You do not need to create a service account for this setup
- The Sheets API is called with the user's own OAuth token (from Firebase Auth)
- This means each user needs read/write permission on the sheet — or the sheet must be shared with anyone with the link
- Recommended: share the sheet with **"Anyone with the link can edit"** and control access at the app level via the `admins` tab
