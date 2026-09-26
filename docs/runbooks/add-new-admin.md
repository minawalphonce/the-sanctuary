# Runbook: Add a New Admin

Use this when someone needs access to the app.

---

## What "admin" means

Anyone the Google Sheet is shared with (as Editor) can log in to the app.
There are no permission levels — all admins see everything.

The `admins` tab is **not** access control. It's a directory the app fills
in by itself: every time an admin logs in, the app records their name,
email and profile photo there. The app uses it to show who is responsible
for a member and who logged a contact.

---

## Steps

1. Open the Google Sheet for this organisation
2. Click **Share** (top right)
3. Add the person's Google email address with the **Editor** role
   - Must be the exact Google account they will log in with
4. Click **Send**
5. Ask them to **open the app and log in once**

Step 5 matters: until they've logged in, they aren't in the `admins` tab,
so they won't appear in the admin pickers (e.g. when assigning members).

Do not type rows into the `admins` tab by hand — the app keys each row by
the person's Firebase user ID, which you don't have.

---

## To remove access

1. Open the Google Sheet → **Share**
2. Remove the person, or change them to no access
3. Leave their row in the `admins` tab — past assignments and logged
   contacts still point to it, so names and photos keep showing correctly

Access is revoked on their next page load or login attempt.

---

## Troubleshooting

**Person sees "access denied" after being added:**
- Check the sheet is shared with the exact Google account they log in with
- Ask them to log out and log back in (their session may be cached)

**Person can log in but doesn't appear in the admin picker:**
- Ask them to fully close and reopen the app — the directory updates on each login
- Check the `admins` tab for a row with their email. If it's missing after
  a login, check the browser console for "Admin directory upsert failed"
