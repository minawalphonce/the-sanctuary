# Runbook: Transfer Ownership

Use this when handing the entire project to another person or organisation.

---

## What needs to be transferred

| Asset | Where |
|---|---|
| Source code | GitHub repository |
| Firebase project | Firebase Console |
| Google Sheet | Google Drive |
| Configuration (`source/app/.env`) | Wherever you keep it (password manager or shared drive) |
| GitHub deploy secrets (if you use CI) | GitHub repository settings |
| This docs folder | Inside the repo |

---

## Step 1 — Handover the Google Sheet

1. Open Google Drive → find the organisation's sheet
2. Right-click → **Share**
3. Add the new owner's Google email with **Editor** access
4. Click the three dots next to their name → **Make owner**
5. Confirm transfer. The new owner may need to accept it
6. You can remove yourself after confirming they have access

Whoever is shared on the sheet can use the app, so check that the existing admins are
still listed as **Editor** and nobody lost access in the transfer.

---

## Step 2 — Transfer Firebase Project Ownership

1. Go to https://console.firebase.google.com → select the project
2. Click the gear icon → **Project settings**
3. Scroll to **Members and roles**
4. Click **Add member**
5. Add the new owner's email → set role to **Owner**
6. Click **Add**
7. Ask them to accept the invitation (they will receive an email)
8. After they accept, remove yourself: find your own email → click the three dots → **Remove**

---

## Step 3 — Transfer GitHub Repository

Option A — if they want the full repo:
1. GitHub → repository → **Settings** → **Danger Zone** → **Transfer**
2. Enter the new owner's GitHub username

Option B — if they just need the code:
1. Download as ZIP: GitHub → **Code** → **Download ZIP**
2. Send them the ZIP

If you use the GitHub Actions deploy (see "Deploy automatically from GitHub" in
[NEW_INSTANCE.md](../setup/NEW_INSTANCE.md)), check that the repository secrets exist in
the new owner's repo: `VITE_FIREBASE_PROJECT_ID`, `VITE_SHEET_ID`, `VITE_ORG_NAME` and
`FIREBASE_SERVICE_ACCOUNT`. Secrets can't be viewed once saved, so if they are missing,
the new owner has to create them again (the service account key comes from Firebase
Console → Project settings → Service accounts).

---

## Step 4 — Hand Over the Configuration File

`source/app/.env` holds this deployment's settings (the Sheet ID and organisation name,
plus any optional settings). It is NOT in the repo, and the new owner needs it to rebuild
and redeploy the app. It contains no passwords, but it is still private to the
organisation, so don't post it publicly or commit it.

1. Find where this was stored (password manager or secure shared drive)
2. Share it with the new owner, for example through a shared password manager
   (1Password, Bitwarden) or a shared drive folder

If it's lost, it can be recreated from [NEW_INSTANCE.md](../setup/NEW_INSTANCE.md) step 3.

---

## Step 5 — Walk Them Through It

Before fully handing over:
- [ ] Walk them through [NEW_INSTANCE.md](../setup/NEW_INSTANCE.md) so they understand the structure
- [ ] Show them how to add/remove admins ([add-new-admin.md](add-new-admin.md))
- [ ] Make sure they can deploy (step 4 of [NEW_INSTANCE.md](../setup/NEW_INSTANCE.md))
- [ ] Make sure they can access the Firebase Console
- [ ] Make sure they can access the Google Sheet

---

## Step 6 — Remove Your Own Access

Once confirmed they have everything:
- [ ] Remove yourself from Firebase project (Project settings → Members)
- [ ] Remove yourself from Google Sheet (Share → remove your access)
- [ ] Remove yourself from GitHub repo (if applicable)
- [ ] Remove your own access from GitHub Actions secrets and service accounts you created
- [ ] Delete your local `.env` file for this project

---

## Template Message to Send to New Owner

```
Hi,

I'm transferring The Sanctuary app for [Org Name] to you.

Here's what you now have access to:
- Firebase project: [project-id] — check your email for the invite
- Google Sheet: [link to sheet]
- GitHub repo: [link]

I've also shared the configuration file (source/app/.env) with you via [method].

The full setup and deploy guide is in the repo at docs/setup/NEW_INSTANCE.md.
To add or remove admins, see docs/runbooks/add-new-admin.md.

Let me know if anything is unclear.
```
