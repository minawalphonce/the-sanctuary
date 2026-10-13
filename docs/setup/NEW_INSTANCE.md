# Set Up a New Instance

How to run your own copy of The Sanctuary for your organisation. Each organisation
gets its own Firebase project and its own Google Sheet.

## Prerequisites

Install these before you start:

| What | Why | Check it |
|---|---|---|
| A Google account | Owns the sheet and the Firebase project | |
| [Git](https://git-scm.com/downloads) | To clone the repo | `git --version` |
| [Node.js](https://nodejs.org) 22.23.1 or newer (includes npm) | To build the app. Node 22.23.0 has a bug that breaks `firebase deploy`, so avoid that exact version | `node --version` |
| Firebase CLI | To deploy: `npm install -g firebase-tools` | `firebase --version` |

Then sign in to the Firebase CLI with the Google account that will own the project:

```bash
firebase login
```

You don't need the `gcloud` CLI.

## 1. Create the Google Sheet

The sheet is the app's database. It has **six tabs**, and the tab names must match
exactly:

| Tab | What it holds |
|---|---|
| `admins` | Directory of admins who have signed in (filled in by the app) |
| `members` | The people you look after: contact details, group, photo |
| `assignments` | Which admin is responsible for which member, with history |
| `attendance` | One row per member per session: present or not |
| `sessions` | Regular and special sessions that attendance is taken for |
| `followups` | Log of calls, messages and visits to members, with outcomes |

Every tab, column and format is described in
[google-sheets-structure.md](../architecture/google-sheets-structure.md).

**Easiest way to start: import the template.**

1. Download [sanctuary-template.xlsx](sanctuary-template.xlsx). It has the six tabs
   with the header row already filled in.
2. In [Google Sheets](https://sheets.google.com): **File → Import → Upload** the file,
   then choose **Create new spreadsheet**.
3. Rename the spreadsheet to something like `<Your Organisation> - Sanctuary Data`.

**Or create it by hand.** Make a new Google Sheet with the six tabs above, and fill
row 1 of each tab with its headers. The step-by-step is in
[Creating the sheet by hand](../architecture/google-sheets-structure.md#creating-the-sheet-by-hand).

Whichever way you create it, leave the header row (row 1) alone and don't insert, delete or reorder columns. The
app reads columns by position. Only add new columns to the right, if you need to.

Finally, copy the **Sheet ID** from the URL. It's the part between `/d/` and `/edit`.
You'll need it in step 3:
`https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

## 2. Create the Firebase project

1. In the [Firebase Console](https://console.firebase.google.com), **Add project**
   (Google Analytics isn't needed). The project ID can't be changed later.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**, and set
   a support email.
3. **Project settings → Your apps → Web (`</>`)**: register a web app. The deployed app
   reads its Firebase settings from this registration automatically.
4. **Build → Hosting → Get started** (you can skip the CLI commands it shows).
5. **Build → Storage → Get started.** This is needed for member photos.
6. **Enable the Google Sheets API.** The app talks to your sheet through it. Every
   Firebase project is also a Google Cloud project with the same project ID, so you do
   this in the Google Cloud Console. Open this link, replacing `<project-id>` with your
   Firebase project ID (Firebase Console → Project settings → General → **Project ID**):

   `https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=<project-id>`

   Check that your project is selected in the project picker at the top of the page,
   then click **Enable**. The button changes to **Manage** / "API enabled" when it's
   done. That is the only Google Cloud step. The sign-in client and OAuth settings are
   already created for you when you enable Google sign-in in step 2.

## 3. Configure the app

```bash
git clone https://github.com/<you>/the-sanctuary.git
cd the-sanctuary
```

Create `source/app/.env`. The easiest way is to copy the example file, which has every
variable with comments, and then fill in the values:

```bash
cp docs/config/.env.example source/app/.env
```

Every deployment needs these two values:

```bash
VITE_SHEET_ID=<sheet id from step 1>
VITE_ORG_NAME=<your organisation name>
```

These are compiled into the build, so they must be set before you build. Never commit
`.env` (it's already gitignored), and keep a copy somewhere safe.

Optional settings (the defaults are used if you leave them out):

```bash
VITE_REGULAR_SESSION_WEEKDAY=saturday   # day your regular session happens
VITE_DASHBOARD_TOP_X=5                  # dashboard fallback list: top X members...
VITE_DASHBOARD_LAST_Y=8                 # ...missing the most of the last Y sessions
```

**Only if you want to run the app on your computer** (`npm run dev`, for example to
contribute), also add your Firebase web app config. Find it in Firebase Console →
Project settings → Your apps. A deployed app doesn't need these.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 4. Deploy

From the repo root:

```bash
cd source/app
npm ci
npm run build

cd ..
firebase use <your-project-id>
firebase deploy
```

`firebase use` links this folder to your project. It's saved in `source/.firebaserc`,
which is gitignored, so you do it once per clone.

The storage rules come from [source/storage.rules](../../source/storage.rules);
[docs/config/firebase.rules](../config/firebase.rules) is a reference copy you can use as
a starting point if you want to change them.

The first `firebase deploy` publishes both the app (hosting) and the storage rules
that member photos need. The URL is printed at the end (`https://<project-id>.web.app`).

To ship later changes, rebuild and run `firebase deploy --only hosting`.

## 5. Give people access

Access is controlled **only by sharing the Google Sheet**. The sheet is the source of
truth for who is allowed in.

1. Open the sheet → **Share** → add each admin's Google account as **Editor**.
   Don't share it with "anyone with the link".
2. Each admin opens the app URL and signs in with that account. The app adds them to
   the `admins` tab automatically. Don't edit that tab by hand.
3. Sign in yourself first and add a test member to confirm a row appears in the sheet.

## Optional: deploy automatically from GitHub

`.github/workflows/deploy.yml` deploys on every push to `main`. To use it on your own
repo, add these repository secrets: `VITE_FIREBASE_PROJECT_ID`, `VITE_SHEET_ID`,
`VITE_ORG_NAME`, and `FIREBASE_SERVICE_ACCOUNT` (the JSON key of a Firebase service
account for your project). Add them under GitHub → Settings → Secrets and variables →
Actions.

## Troubleshooting

- **"Access denied" after signing in:** the Google account you signed in with isn't
  shared on the sheet (Editor). Share it, then sign in again.
- **Sign-in popup fails on your domain:** add the domain under Authentication →
  Settings → Authorised domains. `*.web.app` and `*.firebaseapp.com` are there by
  default, so this only matters for a custom domain.
- **Data not loading:** check `VITE_SHEET_ID`, that the Google Sheets API is enabled,
  and that the six tab names match exactly.
- **Old version after a deploy:** the PWA shows a "reload" prompt, or close and
  reopen the installed app.

More in [../runbooks/troubleshooting.md](../runbooks/troubleshooting.md).
