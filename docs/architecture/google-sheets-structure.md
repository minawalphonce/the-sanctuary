# Google Sheets Structure

The Google Sheet is the database. This document defines every tab, every column,
and the expected data format. Keep this file updated whenever the sheet changes.

---

## Sheet ID

Found in the sheet URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit
```

This value goes in `.env` as `VITE_SHEET_ID`.

---

## Access Control

Access to the app is controlled via **Google Sheet sharing settings**, not a tab in the sheet.

- To **grant access**: share the sheet with the person's Google account (Editor role)
- To **revoke access**: remove them from the sheet's sharing settings
- The sheet should **not** be shared publicly or via link — only with specific Google accounts

---

## Tabs

### `members`

All youth members.

| Column | Header | Format | Notes |
|---|---|---|---|
| A | id | UUID or row number | Unique, never reuse |
| B | full_name | Text | |
| C | date_of_birth | DD/MM/YYYY | |
| D | phone | Text | Include country code |
| E | parent_phone | Text | Also used as the emergency contact number |
| F | group | Text | e.g. "seniors", "juniors" |
| G | active | TRUE / FALSE | |
| H | notes | Text | Free text |
| I | email | Text | |
| J | address | Text | Free text, multi-line |
| K | whatsapp | Text | Handle/number |
| L | instagram | Text | Handle |
| M | tiktok | Text | Handle |
| N | photo_url | Text | Firebase Storage download URL; blank if no photo uploaded |

---

### `attendance`

One row per member per session.

| Column | Header | Format | Notes |
|---|---|---|---|
| A | date | DD/MM/YYYY | |
| B | member_id | Matches `members.id` | |
| C | present | TRUE / FALSE | |
| D | recorded_by | Email | Admin who recorded |
| E | recorded_at | ISO timestamp | App sets this automatically |

---

### `sessions`

Defines recurring (regular) and one-off (special) attendance sessions. Sessions
apply to all members — there is no per-group/class scoping. Attendance rows link
to a session via `date` (see `attendance` above), on the assumption that a given
session occurs at most once per day.

| Column | Header | Format | Notes |
|---|---|---|---|
| A | id | UUID | Unique, never reuse |
| B | date | DD/MM/YYYY | The app defaults this to the upcoming Saturday for new "regular" rows |
| C | type | "regular" / "special" | |
| D | name | Text | Free text. The app defaults this to "Lesson" for new "regular" rows, but it's editable like any other row. For "special" rows, the user types a name (e.g. "Mountain Retreat 2024"). |
| E | notes | Text | Free text — location, time, schedule description, etc. |
| F | status | "active" / "completed" / "archived" | |

---

### `followup`

Follow-up tasks and notes for members.

| Column | Header | Format | Notes |
|---|---|---|---|
| A | id | UUID | |
| B | member_id | Matches `members.id` | |
| C | date | DD/MM/YYYY | |
| D | type | Text | e.g. "call", "visit", "message" |
| E | note | Text | |
| F | done | TRUE / FALSE | |
| G | assigned_to | Email | |

---

## Column Rules

- Never delete columns — only add new ones to the right
- Never rename headers — the app reads by column letter, not name
- Row 1 is always the header row — do not use it for data
- IDs are permanent — never reassign an ID to a different record

---

## Backup

Download a copy periodically:
`File → Download → Microsoft Excel (.xlsx)`

Store in the same Google Drive folder as the live sheet.
