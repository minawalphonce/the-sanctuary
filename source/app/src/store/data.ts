import { create } from "zustand";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Member, AttendanceRecord, FollowupRecord, SessionRecord, SheetData } from "@/lib/sheets";
import { loadAll, appendRow, updateRow, findRowIndexById, SheetsAuthExpiredError } from "@/lib/sheets";

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
  sessions: SessionRecord[];

  // Called by DataSync on every poll tick
  sync: () => Promise<void>;

  // Write helpers — update Sheets and patch local state optimistically
  appendMember: (record: Member) => Promise<void>;
  updateMember: (id: string, updated: Member) => Promise<void>;
  appendAttendance: (record: AttendanceRecord) => Promise<void>;
  appendFollowup: (record: FollowupRecord) => Promise<void>;
  updateFollowup: (id: string, updated: FollowupRecord, sheetRowIndex: number) => Promise<void>;
  appendSession: (record: SessionRecord) => Promise<void>;
  updateSession: (id: string, updated: SessionRecord) => Promise<void>;
  // Upserts attendance for every member in `records` for the given date —
  // updates existing rows in place, appends new ones. If `newSession` is
  // given, that session row is appended first (used when saving attendance
  // for a not-yet-persisted upcoming session).
  saveAttendance: (
    date: string,
    records: { member_id: string; present: boolean; recorded_by: string }[],
    newSession?: SessionRecord
  ) => Promise<void>;
}

export const useDataStore = create<DataStore>((set, get) => ({
  syncing: false,
  lastSyncedAt: null,
  error: null,
  admins: [],
  members: [],
  attendance: [],
  followup: [],
  sessions: [],

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
    const now = new Date().toISOString();
    const stamped: Member = { ...record, registered_date: now, last_updated: now };
    const row = [
      stamped.id,
      stamped.full_name,
      stamped.date_of_birth,
      stamped.gender,
      stamped.phone,
      stamped.parent_phone,
      stamped.group,
      stamped.active,
      stamped.notes,
      stamped.email,
      stamped.address,
      stamped.whatsapp,
      stamped.instagram,
      stamped.tiktok,
      stamped.photo_url,
      stamped.registered_date,
      stamped.last_updated,
      stamped.assigned_to,
    ];
    await withExpiryHandling(() => appendRow("members", row));
    set((s) => ({ members: [...s.members, stamped] }));
  },

  updateMember: async (id, updated) => {
    const index = get().members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error(`Member ${id} not found`);
    const stamped: Member = { ...updated, last_updated: new Date().toISOString() };
    const sheetRow = index + 2; // +1 for 1-based, +1 for header row
    const range = `members!A${sheetRow}:R${sheetRow}`;
    const row = [
      stamped.id,
      stamped.full_name,
      stamped.date_of_birth,
      stamped.gender,
      stamped.phone,
      stamped.parent_phone,
      stamped.group,
      stamped.active,
      stamped.notes,
      stamped.email,
      stamped.address,
      stamped.whatsapp,
      stamped.instagram,
      stamped.tiktok,
      stamped.photo_url,
      stamped.registered_date,
      stamped.last_updated,
      stamped.assigned_to,
    ];
    await withExpiryHandling(() => updateRow(range, row));
    set((s) => ({ members: s.members.map((m) => (m.id === id ? stamped : m)) }));
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

  appendSession: async (record) => {
    const row = [record.id, record.date, record.type, record.name, record.notes, record.status];
    await withExpiryHandling(() => appendRow("sessions", row));
    set((s) => ({ sessions: [...s.sessions, record] }));
  },

  updateSession: async (id, updated) => {
    const index = await withExpiryHandling(() => findRowIndexById("sessions", id));
    const sheetRow = index + 2; // +1 for 1-based, +1 for header row
    const range = `sessions!A${sheetRow}:F${sheetRow}`;
    const row = [updated.id, updated.date, updated.type, updated.name, updated.notes, updated.status];
    await withExpiryHandling(() => updateRow(range, row));
    set((s) => ({ sessions: s.sessions.map((session) => (session.id === id ? updated : session)) }));
  },

  saveAttendance: async (date, records, newSession) => {
    if (newSession) {
      await get().appendSession(newSession);
    }

    const existing = get().attendance;
    const recordedAt = new Date().toISOString();
    const toAppend: AttendanceRecord[] = [];
    const updatedExisting = [...existing];

    for (const r of records) {
      const stamped: AttendanceRecord = {
        date,
        member_id: r.member_id,
        present: r.present,
        recorded_by: r.recorded_by,
        recorded_at: recordedAt,
      };
      const index = existing.findIndex((a) => a.date === date && a.member_id === r.member_id);
      if (index === -1) {
        toAppend.push(stamped);
      } else {
        const sheetRow = index + 2; // +1 for 1-based, +1 for header row
        const range = `attendance!A${sheetRow}:E${sheetRow}`;
        const row = [stamped.date, stamped.member_id, stamped.present, stamped.recorded_by, stamped.recorded_at];
        await withExpiryHandling(() => updateRow(range, row));
        updatedExisting[index] = stamped;
      }
    }

    for (const stamped of toAppend) {
      const row = [stamped.date, stamped.member_id, stamped.present, stamped.recorded_by, stamped.recorded_at];
      await withExpiryHandling(() => appendRow("attendance", row));
    }

    set({ attendance: [...updatedExisting, ...toAppend] });
  },
}));
