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
| E | parent_phone | Text | |
| F | group | Text | e.g. "seniors", "juniors" |
| G | active | TRUE / FALSE | |
| H | notes | Text | Free text |

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
