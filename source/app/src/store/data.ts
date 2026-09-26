import { create } from "zustand";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Admin, Assignment, Member, AttendanceRecord, FollowupRecord, SessionRecord, SheetData } from "@/lib/sheets";
import { loadAll, upsertAdmin, appendRow, appendRows, updateRow, batchUpdateRows, findRowIndexById, SheetsAuthExpiredError } from "@/lib/sheets";
import { currentAssignmentsByMember } from "@/lib/assignments";

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
  admins: Admin[];
  members: Member[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  followup: FollowupRecord[];
  sessions: SessionRecord[];

  // Called by DataSync on every poll tick
  sync: () => Promise<void>;

  // Records the signed-in user in the admins directory. Best-effort — callers
  // shouldn't await it on the load path; it's retried on the next login.
  upsertCurrentAdmin: () => Promise<void>;

  // Write helpers — update Sheets and patch local state optimistically
  // Makes `adminId` responsible for each member: closes any current row and
  // appends a new one. Optimistic — local state updates immediately and is
  // rolled back (then the promise rejects) if either write fails. Members
  // already assigned to `adminId` are skipped.
  assign: (memberIds: string[], adminId: string) => Promise<void>;

  appendMember: (record: Member) => Promise<void>;
  updateMember: (id: string, updated: Member) => Promise<void>;
  appendAttendance: (record: AttendanceRecord) => Promise<void>;
  // Optimistic — the record shows immediately and is removed again (then the
  // promise rejects) if the write fails.
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
  assignments: [],
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

  upsertCurrentAdmin: async () => {
    const user = auth.currentUser;
    if (!user) return;
    const admin = await withExpiryHandling(() => upsertAdmin(user));
    set((s) => ({
      admins: s.admins.some((a) => a.id === admin.id)
        ? s.admins.map((a) => (a.id === admin.id ? admin : a))
        : [...s.admins, admin],
    }));
  },

  assign: async (memberIds, adminId) => {
    const previous = get().assignments;
    const current = currentAssignmentsByMember(previous);
    const targets = Array.from(new Set(memberIds)).filter((id) => current.get(id)?.admin_id !== adminId);
    if (targets.length === 0) return;

    // Same timestamp for the closing `to` and the new `from`.
    const now = new Date().toISOString();
    const assignedBy = auth.currentUser?.uid ?? "";
    const toClose = targets.map((id) => current.get(id)).filter((a): a is Assignment => !!a);
    const closedIds = new Set(toClose.map((a) => a.id));
    const created: Assignment[] = targets.map((memberId) => ({
      id: crypto.randomUUID(),
      member_id: memberId,
      admin_id: adminId,
      assigned_by: assignedBy,
      from: now,
      to: "",
      row: -1, // unknown until the append returns
    }));

    set({
      assignments: [...previous.map((a) => (closedIds.has(a.id) ? { ...a, to: now } : a)), ...created],
    });

    try {
      await withExpiryHandling(async () => {
        if (toClose.length > 0) {
          await batchUpdateRows(toClose.map((a) => ({ range: `assignments!F${a.row}`, row: [now] })));
        }
        const firstRow = await appendRows(
          "assignments",
          created.map((a) => [a.id, a.member_id, a.admin_id, a.assigned_by, a.from, a.to])
        );
        const rowById = new Map(created.map((a, i) => [a.id, firstRow + i]));
        set((s) => ({
          assignments: s.assignments.map((a) => (rowById.has(a.id) ? { ...a, row: rowById.get(a.id)! } : a)),
        }));
      });
    } catch (err) {
      set({ assignments: previous });
      // The close may have landed before the append failed — resync so local
      // state matches the sheet rather than the pre-write snapshot.
      get().sync();
      throw err;
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
    ];
    await withExpiryHandling(() => appendRow("members", row));
    set((s) => ({ members: [...s.members, stamped] }));
  },

  updateMember: async (id, updated) => {
    const index = get().members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error(`Member ${id} not found`);
    const stamped: Member = { ...updated, last_updated: new Date().toISOString() };
    const sheetRow = index + 2; // +1 for 1-based, +1 for header row
    const range = `members!A${sheetRow}:Q${sheetRow}`;
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
    const row = [record.id, record.member_id, record.date, record.type, record.outcome, record.notes, record.admin_id, record.timestamp];
    set((s) => ({ followup: [...s.followup, record] }));
    try {
      await withExpiryHandling(() => appendRow("followups", row));
    } catch (err) {
      set((s) => ({ followup: s.followup.filter((f) => f.id !== record.id) }));
      throw err;
    }
  },

  // sheetRowIndex is 1-based data row (row 2 in sheet = index 1 in the array = sheet row 2)
  updateFollowup: async (id, updated, sheetRowIndex) => {
    const sheetRow = sheetRowIndex + 2; // +1 for 1-based, +1 for header row
    const range = `followups!A${sheetRow}:H${sheetRow}`;
    const row = [updated.id, updated.member_id, updated.date, updated.type, updated.outcome, updated.notes, updated.admin_id, updated.timestamp];
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
