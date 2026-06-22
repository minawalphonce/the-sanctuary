# UX vs. Data Model — Gap Review & Decisions

Review of designer handoff screens against the Google Sheets data model
(see [`google-sheets-structure.md`](./google-sheets-structure.md)), and the
resulting decisions on what changes to the schema.

Screens reviewed: `3.0.members_filtered`, `3.1.members_filter_side_sheet`,
`3.2.member_add_edit`, `3.3.member_profile_updated`,
`3.4.member_profile_contact_tab_updated`,
`3.5.member_profile_history_tab_with_add_button`,
`3.6.member_add_follow_up_modal_3`.

Date: 2026-06-21

---

## 1. `members` tab

**Decision:** Add all new columns implied by the designs (3.2 Add/Edit,
3.3/3.4 Profile + Contact tabs), **except** emergency contact — drop
`emergency_contact_name` and `emergency_relation` from scope and continue
using the existing `parent_phone` column for that purpose.

New columns to append:

| Column | Format | Notes |
|---|---|---|
| `email` | Text | |
| `address` | Text | Free text, multi-line |
| `whatsapp` | Text | Handle/number |
| `instagram` | Text | Handle |
| `tiktok` | Text | Handle |
| `photo_url` | Text | Firebase Storage download URL; blank if no photo |

Not added (rejected): `emergency_contact_name`, `emergency_relation`.
The Contact tab and Add/Edit form's "Emergency Contact" section should
display/edit `parent_phone` only — no name or relation field.

No change to: `id`, `full_name`, `date_of_birth`, `phone`, `group`,
`active`, `notes`.

**Update 2026-06-22:** Photo upload is now in scope (superseding the
"not in scope" call below). Firebase Storage was already provisioned —
bucket configured in `.env`, referenced in `firebase.json` — just unused.
Added `photo_url` (col N) and `storage.rules` restricting read/write to
authenticated users. Avatars without a `photo_url` continue to render as
initials.

~~Not in scope (infrastructure gap, not a schema gap): photo upload. There
is no file storage in this architecture (no Firestore, no Storage
bucket). Avatars continue to render as initials. Revisit only if Firebase
Storage is deliberately added later.~~

Not in scope: "Sort by Recent" (3.1 filter sheet) has no backing field
(no `created_at` on members). Drop this sort option from the filter UI, or
add a `created_at` column if it's wanted later — not decided here.

Display-only, no schema change: the formatted member ID shown in 3.2
(e.g. `SMY-2024-8842`) is derived for display from the existing `id` column,
not a new field.

---

## 2. `attendance` tab

**Decision:** No new column. Attendance status (present / absent) stays
binary via the existing `present` TRUE/FALSE column. Attendance rate,
"last seen X days ago", and similar stats are computed client-side from
existing `attendance` rows.

**Excused absence is dropped entirely.** The activity streak calendar in
3.3 (yellow = excused absence) loses that distinction — streak cells render
as present/absent only (two states, not three). No `excused` or `status`
column is added.

---

## 3. `followup` tab

**Decision:** SMS is dropped from the system entirely. No automated or
manual SMS feature, no SMS-related column. FCM push notifications are the
only automated messaging channel, and they are a separate system feature —
**not** a manually-logged follow-up interaction type.

Interaction Type chips in the Add Follow-up modal (3.6) become three
options instead of four:

- Call
- WhatsApp
- In-person

("Spoke in person" from the mock is shortened to "In-person".)

History entries like "SMS sent — Reminder / Admin: System" (seen in 3.5)
are dropped — there is no automated SMS to log.

**Outcome/status chips** (Will attend / No answer / Promised to attend /
Excused) shown in 3.6: not decided in this review — still an open gap (no
column exists for this). Default for now: fold free-text outcome into the
existing `note` column rather than adding a new `outcome` column, pending
a separate decision.

`assigned_to` (existing column): auto-filled from `auth.currentUser.email`
at save time — not a user-facing input in the Add Follow-up modal.

---

## Net schema diff

Append-only, per the "never delete columns" rule in
[`google-sheets-structure.md`](./google-sheets-structure.md):

- `members`: + `email`, `address`, `whatsapp`, `instagram`, `tiktok`, `photo_url`
- `attendance`: no change
- `followup`: no change
