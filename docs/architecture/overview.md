# Architecture Overview

## Philosophy

This app is built to be simple, free, and handover-friendly. Every decision
prioritises: zero running cost, human-readable data, and the ability for
someone non-technical to take over or abandon the app and fall back to the
spreadsheet.

---

## Why Each Tool Was Chosen

### Firebase Auth (Google Sign-In)
- No password management required
- Everyone already has a Google account
- The same Google token is reused to call the Sheets API — one login, two purposes
- User info (email, name, photo) is read directly from `auth.currentUser` — no extra API call needed
- Free indefinitely at this scale

### Firebase Hosting
- Free tier covers everything needed
- Simple CLI deploy (`firebase deploy`)
- Custom domain support
- Automatic HTTPS

### Google Sheets as Database
- The sheet existed before the app and must survive after it
- Human-readable fallback — anyone can open it in Excel/Sheets
- Edited directly by admins if needed without touching the app
- REST API is plain request/response — no listeners, no SDK magic
- Free

### Firebase Cloud Messaging (FCM)
- Free push notifications
- Works on Android and iOS (via PWA/browser)
- Integrates naturally since Firebase Auth is already in use

### No Firestore / No Backend Server
- Firestore adds complexity (real-time listeners don't match request/response mental model)
- No server means no hosting cost and no maintenance
- Google Sheets API handles all data needs at this scale

---

## Data Flow

```
User (browser)
    │
    ├─── Firebase Auth ──────────────── Google OAuth token + user info
    │         │                         (email, name, photo from auth.currentUser)
    │         │
    │         └─── token used for ───► Google Sheets API
    │                                       │
    │                                  1. Access check (fetch sheet)
    │                                       ├── 200 OK  → allowed in
    │                                       └── 403     → denied
    │                                       │
    │                                  2. Read / Write rows
    │                                       │
    │                                  Google Sheet (source of truth)
    │
    └─── FCM ───────────────────────────── Push notifications
```

## Access Control

Access is managed entirely through **Google Sheet sharing settings** — no `admins` tab, no app-level list.

- To **grant access**: share the Google Sheet with the person's Google account
- To **revoke access**: remove them from the sheet's sharing settings
- The app verifies access at login by attempting to fetch the sheet with the user's token
- A `403` response means no access — the user is shown a "not authorized" screen
- A successful response means access is granted — no further checks needed

---

## Multi-Instance Policy

Each organisation gets its **own Firebase project** and its **own Google Sheet**.

- No shared data between organisations
- No multi-tenant code in the app
- Each deployment is fully independent
- One Firebase project compromise does not affect others

The same codebase is deployed to each instance with a different `.env` file.
See [`setup/NEW_INSTANCE.md`](../setup/NEW_INSTANCE.md).

---

## Constraints & Known Limitations

| Constraint | Impact |
|---|---|
| Google Sheets concurrent writes | Two admins writing simultaneously may conflict. Acceptable at <10 admins. |
| Sheets API rate limit | 100 requests/100 seconds per user. Not a concern at this scale. |
| FCM on iOS | Requires iOS 16.4+ and app must be added to home screen. |
| Offline writes | Not supported. Offline mode shows cached data read-only. |
