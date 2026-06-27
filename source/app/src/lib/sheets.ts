// Sheets API client — reads and appends rows.
// All reads go through batchGet for a single round-trip.
// Auth token is the Google OAuth access token stored after sign-in.
// Firebase ID tokens are NOT accepted by the Sheets API — we need the
// Google credential that was returned by GoogleAuthProvider at sign-in time.

import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

const SHEET_ID = import.meta.env.VITE_SHEET_ID as string;
const BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// Google access tokens are valid for ~1h; cache for 55min to stay safely inside that.
const TOKEN_TTL_MS = 55 * 60 * 1000;
const TOKEN_STORAGE_KEY = "sanctuary.googleAccessToken";

interface StoredToken {
  token: string;
  expiresAt: number;
}

// Thrown when the Sheets token has expired. There's no silent way to mint
// a new one — Google access tokens can only be (re)issued via a user
// gesture (signInWithPopup), so callers should sign the user out and send
// them back to /login rather than retry automatically.
export class SheetsAuthExpiredError extends Error {
  constructor() {
    super("Google session expired — please sign in again.");
  }
}

export function setGoogleAccessToken(token: string) {
  const stored: StoredToken = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(stored));
}

export function getGoogleAccessTokenFromResult(result: Parameters<typeof GoogleAuthProvider.credentialFromResult>[0]) {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  return credential?.accessToken ?? null;
}

function readStoredToken(): string | null {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  const stored: StoredToken = JSON.parse(raw);
  if (Date.now() >= stored.expiresAt) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
  return stored.token;
}

async function token(): Promise<string> {
  if (!auth.currentUser) throw new Error("Not authenticated");
  const cached = readStoredToken();
  if (!cached) throw new SheetsAuthExpiredError();
  return cached;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const t = await token();
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${t}` },
  });

  if (res.status === 401) {
    // Google rejected the cached token outright — treat same as expiry.
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    throw new SheetsAuthExpiredError();
  }

  return res;
}

export type AccessCheckResult =
  | { status: "ok" }
  | { status: "forbidden" }
  | { status: "unauthenticated" }
  | { status: "network-error" };

// Lightweight call used right after login (and on every app open) to confirm
// the signed-in user is actually shared on the sheet, before loading any data.
export async function checkAccess(): Promise<AccessCheckResult> {
  try {
    const res = await fetchWithAuth(`${BASE}/${SHEET_ID}?fields=spreadsheetId`);
    if (res.ok) return { status: "ok" };
    if (res.status === 403) return { status: "forbidden" };
    return { status: "network-error" };
  } catch (err) {
    if (err instanceof SheetsAuthExpiredError) return { status: "unauthenticated" };
    return { status: "network-error" };
  }
}

async function get(ranges: string[]): Promise<string[][][]> {
  const params = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
  const res = await fetchWithAuth(
    `${BASE}/${SHEET_ID}/values:batchGet?${params}&valueRenderOption=UNFORMATTED_VALUE`
  );
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`);
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.valueRanges as any[]).map((vr) => vr.values ?? []);
}

// RAW (not USER_ENTERED) — USER_ENTERED parses date-shaped strings like
// "04/07/2026" the way a human typing into the cell would, silently
// converting them into Sheets' internal date serial number (e.g. 46119)
// instead of keeping the literal DD/MM/YYYY text this app stores and reads.
export async function appendRow(tab: string, row: (string | boolean | number)[]): Promise<void> {
  const res = await fetchWithAuth(
    `${BASE}/${SHEET_ID}/values/${encodeURIComponent(tab)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!res.ok) throw new Error(`Sheets append failed: ${res.status}`);
}

export async function updateRow(range: string, row: (string | boolean | number)[]): Promise<void> {
  const res = await fetchWithAuth(
    `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!res.ok) throw new Error(`Sheets update failed: ${res.status}`);
}

// Looks up a row's 0-based data-row index by id, reading column A fresh.
// Needed for tabs like `sessions` where soft-deleted rows are filtered out
// of the in-memory array after loadAll(), so that array's position no
// longer matches the sheet's actual row position — unlike members/followup,
// which never filter and can safely use their array index directly.
export async function findRowIndexById(tab: string, id: string): Promise<number> {
  const [idRows] = await get([`${tab}!A2:A`]);
  const index = idRows.findIndex((r) => String(r[0] ?? "") === id);
  if (index === -1) throw new Error(`${tab} row with id ${id} not found`);
  return index;
}

// --- Row parsers (row 0 is header, skip it) ---

export interface Member {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  parent_phone: string;
  group: string;
  active: boolean;
  notes: string;
  email: string;
  address: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  photo_url: string;
  registered_date: string;
  last_updated: string;
  assigned_to: string;
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

export type SessionType = "regular" | "special";
export type SessionStatus = "active" | "completed" | "archived";

export interface SessionRecord {
  id: string;
  date: string;
  type: SessionType;
  name: string;
  notes: string;
  status: SessionStatus;
}

export interface SheetData {
  admins: string[];
  members: Member[];
  attendance: AttendanceRecord[];
  followup: FollowupRecord[];
  sessions: SessionRecord[];
}

export async function loadAll(): Promise<SheetData> {
  const [adminRows, memberRows, attendanceRows, followupRows, sessionRows] = await get([
    "admins!A2:A",
    "members!A2:R",
    "attendance!A2:E",
    "followup!A2:G",
    "sessions!A2:F",
  ]);

  const admins = adminRows.map((r) => String(r[0] ?? "").trim()).filter(Boolean);

  const members: Member[] = memberRows
    .filter((r) => r[0])
    .map((r) => ({
      id: String(r[0] ?? ""),
      full_name: String(r[1] ?? ""),
      date_of_birth: String(r[2] ?? ""),
      gender: String(r[3] ?? ""),
      phone: String(r[4] ?? ""),
      parent_phone: String(r[5] ?? ""),
      group: String(r[6] ?? ""),
      active: String(r[7]).toUpperCase() === "TRUE",
      notes: String(r[8] ?? ""),
      email: String(r[9] ?? ""),
      address: String(r[10] ?? ""),
      whatsapp: String(r[11] ?? ""),
      instagram: String(r[12] ?? ""),
      tiktok: String(r[13] ?? ""),
      photo_url: String(r[14] ?? ""),
      registered_date: String(r[15] ?? ""),
      last_updated: String(r[16] ?? ""),
      assigned_to: String(r[17] ?? ""),
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

  const sessions: SessionRecord[] = sessionRows
    .filter((r) => r[0])
    .map((r) => ({
      id: String(r[0] ?? ""),
      date: String(r[1] ?? ""),
      type: (String(r[2] ?? "").toLowerCase() === "special" ? "special" : "regular") as SessionType,
      name: String(r[3] ?? ""),
      notes: String(r[4] ?? ""),
      status: (["active", "completed", "archived"].includes(String(r[5] ?? "").toLowerCase())
        ? String(r[5]).toLowerCase()
        : "active") as SessionStatus,
    }));

  return { admins, members, attendance, followup, sessions };
}
