# Runbook: Transfer Ownership

Use this when handing the entire project to another person or organisation.

---

## What needs to be transferred

| Asset | Where |
|---|---|
| Source code | GitHub repository |
| Firebase project | Firebase Console |
| Google Sheet | Google Drive |
| Environment file (.env) | Secure storage |
| This docs folder | Inside the repo |

---

## Step 1 — Handover the Google Sheet

1. Open Google Drive → find the organisation's sheet
2. Right-click → **Share**
3. Add the new owner's Google email with **Editor** access
4. Click the three dots next to their name → **Make owner**
5. Confirm transfer
6. You can remove yourself after confirming they have access

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

---

## Step 4 — Hand Over the .env File

The `.env` file contains all secrets for this deployment. It is NOT in the repo.

1. Find where this was stored (password manager or secure shared drive)
2. Share it securely — do NOT send by email
   - Use a password manager with sharing (1Password, Bitwarden)
   - Or share via an encrypted message (Signal, etc.)

---

## Step 5 — Walk Them Through It

Before fully handing over:
- [ ] Walk them through `setup/NEW_INSTANCE.md` so they understand the structure
- [ ] Show them how to add/remove admins (`runbooks/add-new-admin.md`)
- [ ] Make sure they can deploy: `./docs/scripts/deploy.sh`
- [ ] Make sure they can access the Firebase Console
- [ ] Make sure they can access the Google Sheet

---

## Step 6 — Remove Your Own Access

Once confirmed they have everything:
- [ ] Remove yourself from Firebase project (Project settings → Members)
- [ ] Remove yourself from Google Sheet (Share → remove your access)
- [ ] Remove yourself from GitHub repo (if applicable)
- [ ] Delete your local `.env` file for this project

---

## Template Message to Send to New Owner

```
Hi,

I'm transferring the Youth Admin App for [Org Name] to you.

Here's what you now have access to:
- Firebase project: [project-id] — check your email for the invite
- Google Sheet: [link to sheet]
- GitHub repo: [link]

I've also sent you the .env file separately via [method].

The full setup guide is in the repo at docs/setup/NEW_INSTANCE.md.
To add or remove admins, see docs/runbooks/add-new-admin.md.

Let me know if anything is unclear.
```
