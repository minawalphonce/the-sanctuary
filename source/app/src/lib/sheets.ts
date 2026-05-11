// Sheets API client — reads and appends rows.
// All reads go through batchGet for a single round-trip.
// Auth token is the Google OAuth access token stored after sign-in.
// Firebase ID tokens are NOT accepted by the Sheets API — we need the
// Google credential that was returned by GoogleAuthProvider at sign-in time.

import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

const SHEET_ID = import.meta.env.VITE_SHEET_ID as string;
const BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// Call this after signInWithPopup/signInWithRedirect and store the result.
let _googleAccessToken: string | null = null;

export function setGoogleAccessToken(token: string) {
  _googleAccessToken = token;
}

export function getGoogleAccessTokenFromResult(result: Parameters<typeof GoogleAuthProvider.credentialFromResult>[0]) {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  return credential?.accessToken ?? null;
}

async function token(): Promise<string> {
  if (!auth.currentUser) throw new Error("Not authenticated");
  if (!_googleAccessToken) throw new Error("Google access token not set — call setGoogleAccessToken after sign-in");
  return _googleAccessToken;
}

async function get(ranges: string[]): Promise<string[][][]> {
  const t = await token();
  const params = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
  const res = await fetch(
    `${BASE}/${SHEET_ID}/values:batchGet?${params}&valueRenderOption=UNFORMATTED_VALUE`,
    { headers: { Authorization: `Bearer ${t}` } }
  );
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`);
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.valueRanges as any[]).map((vr) => vr.values ?? []);
}

export async function appendRow(tab: string, row: (string | boolean | number)[]): Promise<void> {
  const t = await token();
  const res = await fetch(
    `${BASE}/${SHEET_ID}/values/${encodeURIComponent(tab)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!res.ok) throw new Error(`Sheets append failed: ${res.status}`);
}

export async function updateRow(range: string, row: (string | boolean | number)[]): Promise<void> {
  const t = await token();
  const res = await fetch(
    `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!res.ok) throw new Error(`Sheets update failed: ${res.status}`);
}

// --- Row parsers (row 0 is header, skip it) ---

export interface Member {
  id: string;
  full_name: string;
  date_of_birth: string;
  phone: string;
  parent_phone: string;
  group: string;
  active: boolean;
  notes: string;
}

export interface AttendanceRecord {
  date: string;
  member_id: string;
  present: boolean;
  recorded_by: string;
  recorded_at: string;
}

export interface FollowupRecord {
  id: string;
  member_id: string;
  date: string;
  type: string;
  note: string;
  done: boolean;
  assigned_to: string;
}

export interface SheetData {
  admins: string[];
  members: Member[];
  attendance: AttendanceRecord[];
  followup: FollowupRecord[];
}

export async function loadAll(): Promise<SheetData> {
  const [adminRows, memberRows, attendanceRows, followupRows] = await get([
    "admins!A2:A",
    "members!A2:H",
    "attendance!A2:E",
    "followup!A2:G",
  ]);

  const admins = adminRows.map((r) => String(r[0] ?? "").trim()).filter(Boolean);

  const members: Member[] = memberRows
    .filter((r) => r[0])
    .map((r) => ({
      id: String(r[0] ?? ""),
      full_name: String(r[1] ?? ""),
      date_of_birth: String(r[2] ?? ""),
      phone: String(r[3] ?? ""),
      parent_phone: String(r[4] ?? ""),
      group: String(r[5] ?? ""),
      active: String(r[6]).toUpperCase() === "TRUE",
      notes: String(r[7] ?? ""),
    }));

  const attendance: AttendanceRecord[] = attendanceRows
    .filter((r) => r[0])
    .map((r) => ({
      date: String(r[0] ?? ""),
      member_id: String(r[1] ?? ""),
      present: String(r[2]).toUpperCase() === "TRUE",
      recorded_by: String(r[3] ?? ""),
      recorded_at: String(r[4] ?? ""),
    }));

  const followup: FollowupRecord[] = followupRows
    .filter((r) => r[0])
    .map((r) => ({
      id: String(r[0] ?? ""),
      member_id: String(r[1] ?? ""),
      date: String(r[2] ?? ""),
      type: String(r[3] ?? ""),
      note: String(r[4] ?? ""),
      done: String(r[5]).toUpperCase() === "TRUE",
      assigned_to: String(r[6] ?? ""),
    }));

  return { admins, members, attendance, followup };
}
