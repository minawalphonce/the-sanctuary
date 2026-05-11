# Runbook: Add a New Admin

Use this when someone needs access to the app.

---

## What "admin" means

Anyone whose email is in the `admins` tab of the Google Sheet can log in
to the app. There are no permission levels — all admins see everything.

---

## Steps

1. Open the Google Sheet for this organisation
2. Click the **`admins`** tab at the bottom
3. Scroll to the first empty row
4. Type the person's Google email address in **column A**
   - Must be the exact email they use for their Google account
   - Lowercase, no extra spaces
5. Save (Ctrl+S or Cmd+S)

That's it. The person can now log in immediately — no app changes, no redeploy needed.

---

## To remove access

1. Open the `admins` tab
2. Find the person's row
3. Delete the entire row (right-click → Delete row)

Access is revoked immediately on their next page load or login attempt.

If they are currently logged in, they will be blocked on their next API call
(the app checks admin status on every request).

---

## Troubleshooting

**Person says "access denied" after being added:**
- Check for typos in the email — it must match exactly
- Check for extra spaces before or after the email in the cell
- Ask them to log out and log back in (their session may be cached)

**Person can log in with Google but still sees "access denied":**
- They may be logging in with a different Google account than the one you added
- Ask them: "Which Google account did you use to log in?" and verify it matches what's in the sheet
