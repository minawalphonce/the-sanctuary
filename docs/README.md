# Docs — Infrastructure & Operations

This folder contains everything needed to understand, deploy, and hand over this project.

## Stack

| Layer | Tool |
|---|---|
| Hosting | Firebase Hosting |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Google Sheets API (REST) |
| Notifications | Firebase Cloud Messaging (FCM) |
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
│   ├── firebase-console-steps.md  ← manual Firebase console steps
│   └── google-cloud-steps.md      ← enabling APIs, OAuth consent screen
│
├── scripts/
│   ├── create-instance.sh         ← automates Firebase project creation
│   ├── deploy.sh                  ← build + deploy
│   └── validate-env.sh            ← checks .env before deploy
│
├── config/
│   ├── .env.example               ← all required env vars with descriptions
│   └── firebase.rules             ← Firestore/Storage security rules template
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
