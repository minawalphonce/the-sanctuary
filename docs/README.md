# Docs — Infrastructure & Operations

This folder contains everything needed to understand, set up, and hand over this project.

## Stack

| Layer | Tool |
|---|---|
| Hosting | Firebase Hosting |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Google Sheets API (REST) |
| File storage | Firebase Storage (member photos) |
| Notifications | Firebase Cloud Messaging (FCM) — planned, see the [roadmap](architecture/overview.md#roadmap) |
| Frontend | React + Vite (PWA) |

## Folder Structure

```
docs/
├── architecture/
│   ├── overview.md                 ← why each tool was chosen
│   └── google-sheets-structure.md ← sheet tabs, columns, data shape
│
├── setup/
│   ├── NEW_INSTANCE.md             ← start here for a new deployment
│   └── sanctuary-template.xlsx    ← starter Google Sheet (six tabs with headers)
│
├── config/
│   ├── .env.example               ← copy to source/app/.env and fill in
│   └── firebase.rules             ← reference copy of the Storage rules
│
└── runbooks/
    ├── add-new-admin.md           ← how to grant someone access
    ├── transfer-ownership.md      ← how to hand this project to someone else
    └── troubleshooting.md         ← common issues and fixes
```

## Starting a New Instance?

Go to [`setup/NEW_INSTANCE.md`](setup/NEW_INSTANCE.md) — that is your checklist.

## Something broken?

Go to [`runbooks/troubleshooting.md`](runbooks/troubleshooting.md).
