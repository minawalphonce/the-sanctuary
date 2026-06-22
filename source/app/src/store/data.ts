import { create } from "zustand";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Member, AttendanceRecord, FollowupRecord, SheetData } from "@/lib/sheets";
import { loadAll, appendRow, updateRow, SheetsAuthExpiredError } from "@/lib/sheets";

// The Sheets access token can't be silently refreshed (Google requires a
// user gesture). When it expires, sign out so the user lands back on
// /login and a click re-popups a fresh token — rather than getting stuck
// with sync calls failing forever in the background.
async function withExpiryHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof SheetsAuthExpiredError) {
      await signOut(auth);
    }
    throw err;
  }
}

interface SyncMeta {
  syncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

interface DataStore extends SyncMeta {
  admins: string[];
  members: Member[];
  attendance: AttendanceRecord[];
  followup: FollowupRecord[];

  // Called by DataSync on every poll tick
  sync: () => Promise<void>;

  // Write helpers — update Sheets and patch local state optimistically
  appendMember: (record: Member) => Promise<void>;
  appendAttendance: (record: AttendanceRecord) => Promise<void>;
  appendFollowup: (record: FollowupRecord) => Promise<void>;
  updateFollowup: (id: string, updated: FollowupRecord, sheetRowIndex: number) => Promise<void>;
}

export const useDataStore = create<DataStore>((set, get) => ({
  syncing: false,
  lastSyncedAt: null,
  error: null,
  admins: [],
  members: [],
  attendance: [],
  followup: [],

  sync: async () => {
    if (get().syncing) return;
    set({ syncing: true, error: null });
    try {
      const data: SheetData = await withExpiryHandling(loadAll);
      set({ ...data, syncing: false, lastSyncedAt: new Date() });
    } catch (err) {
      set({ syncing: false, error: err instanceof Error ? err.message : "Sync failed" });
    }
  },

  appendMember: async (record) => {
    const row = [
      record.id,
      record.full_name,
      record.date_of_birth,
      record.phone,
      record.parent_phone,
      record.group,
      record.active,
      record.notes,
      record.email,
      record.address,
      record.whatsapp,
      record.instagram,
      record.tiktok,
      record.photo_url,
    ];
    await withExpiryHandling(() => appendRow("members", row));
    set((s) => ({ members: [...s.members, record] }));
  },

  appendAttendance: async (record) => {
    const row = [record.date, record.member_id, record.present, record.recorded_by, record.recorded_at];
    await withExpiryHandling(() => appendRow("attendance", row));
    set((s) => ({ attendance: [...s.attendance, record] }));
  },

  appendFollowup: async (record) => {
    const row = [record.id, record.member_id, record.date, record.type, record.note, record.done, record.assigned_to];
    await withExpiryHandling(() => appendRow("followup", row));
    set((s) => ({ followup: [...s.followup, record] }));
  },

  // sheetRowIndex is 1-based data row (row 2 in sheet = index 1 in the array = sheet row 2)
  updateFollowup: async (id, updated, sheetRowIndex) => {
    const sheetRow = sheetRowIndex + 2; // +1 for 1-based, +1 for header row
    const range = `followup!A${sheetRow}:G${sheetRow}`;
    const row = [updated.id, updated.member_id, updated.date, updated.type, updated.note, updated.done, updated.assigned_to];
    await withExpiryHandling(() => updateRow(range, row));
    set((s) => ({ followup: s.followup.map((f) => (f.id === id ? updated : f)) }));
  },
}));
