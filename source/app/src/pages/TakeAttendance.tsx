import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Calendar, Check, Save, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useDataStore } from "@/store/data";
import { auth } from "@/lib/firebase";
import { initials, avatarPalette } from "@/lib/member";
import { nextRegularSessionDdMmYyyy, findSessionDateCollision } from "@/lib/sessions";
import { cn } from "@/lib/utils";
import type { Member, SessionRecord } from "@/lib/sheets";

type PresentState = "present" | "absent" | null;

function ddMmYyyyToIso(value: string): string {
    if (!value) return "";
    const [d, m, y] = value.split("/");
    if (!d || !m || !y) return "";
    return `${y}-${m}-${d}`;
}

function isoToDdMmYyyy(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function MemberRow({
    member,
    state,
    onSet,
}: {
    member: Member;
    state: PresentState;
    onSet: (next: PresentState) => void;
}) {
    const palette = avatarPalette(member.full_name);

    return (
        <div className="flex items-center justify-between border-b border-ras-outline-variant py-ras-list-item last:border-b-0">
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full text-ras-title-sm",
                        palette.bg,
                        palette.text
                    )}
                >
                    {initials(member.full_name)}
                </div>
                <div>
                    <h4 className="text-ras-title-sm text-ras-on-surface">{member.full_name}</h4>
                    <p className="text-ras-caption text-ras-on-surface-variant">#{member.id}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onSet(state === "absent" ? null : "absent")}
                    className={cn(
                        "flex size-10 items-center justify-center rounded-ras-lg border transition-colors",
                        state === "absent"
                            ? "border-red-800 bg-red-100 text-red-800"
                            : "border-ras-outline-variant hover:bg-ras-surface-container-high"
                    )}
                >
                    <X className="size-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onSet(state === "present" ? null : "present")}
                    className={cn(
                        "flex size-10 items-center justify-center rounded-ras-lg border transition-colors",
                        state === "present"
                            ? "border-green-800 bg-green-100 text-green-800"
                            : "border-ras-outline-variant hover:bg-ras-surface-container-high"
                    )}
                >
                    <Check className="size-5" />
                </button>
            </div>
        </div>
    );
}

export default function TakeAttendance() {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const members = useDataStore((s) => s.members);
    const attendance = useDataStore((s) => s.attendance);
    const sessions = useDataStore((s) => s.sessions);
    const saveAttendance = useDataStore((s) => s.saveAttendance);

    const existingSession = useMemo(
        () => sessions.find((s) => s.id === sessionId),
        [sessions, sessionId]
    );
    const isNewSession = !existingSession;

    // Only the new/draft session's date is editable — an existing session's
    // attendance is already keyed by its current date, so changing it here
    // would silently orphan those rows rather than move them.
    const [draftDate, setDraftDate] = useState(() => nextRegularSessionDdMmYyyy());

    // Either an existing session (row tap) or a not-yet-persisted upcoming
    // regular session (FAB) — the latter only gets written to the sheet on save.
    const session: SessionRecord = existingSession ?? {
        id: crypto.randomUUID(),
        date: draftDate,
        type: "regular",
        name: "Lesson",
        notes: "",
        status: "active",
    };

    const activeMembers = useMemo(() => members.filter((m) => m.active), [members]);
    const allGroups = useMemo(
        () => Array.from(new Set(activeMembers.map((m) => m.group).filter(Boolean))).sort(),
        [activeMembers]
    );
    const [group, setGroup] = useState<string | null>(null);

    const initialStates = useMemo(() => {
        const map = new Map<string, PresentState>();
        for (const a of attendance) {
            if (a.date === session.date) map.set(a.member_id, a.present ? "present" : "absent");
        }
        return map;
    }, [attendance, session.date]);

    const [states, setStates] = useState<Map<string, PresentState>>(initialStates);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return activeMembers
            .filter((m) => !group || m.group === group)
            .filter((m) => !query || m.full_name.toLowerCase().includes(query));
    }, [activeMembers, group, search]);

    const setState = (memberId: string, next: PresentState) => {
        setStates((prev) => {
            const copy = new Map(prev);
            if (next === null) copy.delete(memberId);
            else copy.set(memberId, next);
            return copy;
        });
    };

    const onSave = async () => {
        if (isNewSession && findSessionDateCollision(sessions, session.date)) {
            toast.error("Another session is already scheduled on that date", {
                description: "Pick a different date for this session.",
            });
            return;
        }

        setSaving(true);
        try {
            const recordedBy = auth.currentUser?.email ?? "";
            const records = activeMembers
                .filter((m) => states.has(m.id))
                .map((m) => ({
                    member_id: m.id,
                    present: states.get(m.id) === "present",
                    recorded_by: recordedBy,
                }));
            await saveAttendance(session.date, records, isNewSession ? session : undefined);
            toast.success("Attendance saved", {
                description: `${session.name} — ${records.length} member${records.length === 1 ? "" : "s"} recorded.`,
            });
            navigate("/attendance");
        } catch {
            toast.error("Could not save attendance", {
                description: "Check your connection and try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-ras-surface">
            <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-ras-outline-variant bg-ras-surface px-ras-edge pt-[env(safe-area-inset-top)]">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/attendance")}
                        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-ras-surface-container-high active:opacity-80"
                    >
                        <X className="size-5 text-ras-primary" />
                    </button>
                    <h1 className="text-ras-headline-md font-extrabold text-ras-primary">{session.name}</h1>
                </div>
                {session.type === "special" && (
                    <span className="flex items-center gap-1 rounded-full border border-ras-outline-variant bg-ras-surface-container-low px-3 py-1 text-ras-label-caps text-ras-secondary">
                        <Sparkles className="size-3.5" />
                        Special
                    </span>
                )}
            </header>

            <main className="flex-1 overflow-y-auto px-ras-edge pb-32 pt-4">
                {/* Date emphasis */}
                <div className="mb-4 flex items-center gap-2 rounded-ras-xl border border-ras-secondary/30 bg-ras-secondary-container/40 px-4 py-3">
                    <Calendar className="size-5 shrink-0 text-ras-secondary" />
                    {isNewSession ? (
                        <input
                            value={ddMmYyyyToIso(draftDate)}
                            onChange={(e) => setDraftDate(isoToDdMmYyyy(e.target.value))}
                            type="date"
                            className="bg-transparent text-ras-title-sm text-ras-on-secondary-container outline-none"
                        />
                    ) : (
                        <span className="text-ras-title-sm text-ras-on-secondary-container">{session.date}</span>
                    )}
                </div>

                {/* Group filter */}
                {allGroups.length > 0 && (
                    <div className="mb-4 grid grid-cols-3 gap-3">
                        {allGroups.map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setGroup((current) => (current === g ? null : g))}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-ras-xl border p-3 transition-colors",
                                    group === g
                                        ? "border-ras-primary bg-ras-primary text-ras-on-primary"
                                        : "border-ras-outline-variant bg-ras-surface-container-lowest text-ras-on-surface hover:bg-ras-surface-container-high"
                                )}
                            >
                                <span className="text-ras-label-caps">{g.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Search & Info Bar */}
                <div className="mb-4 flex items-center gap-4 rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-low p-4">
                    <Search className="size-5 shrink-0 text-ras-outline" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search member name..."
                        type="text"
                        className="flex-1 bg-transparent text-ras-body-md text-ras-on-surface outline-none placeholder:text-ras-on-surface-variant"
                    />
                    <div className="h-6 w-px shrink-0 bg-ras-outline-variant" />
                    <span className="shrink-0 whitespace-nowrap text-ras-label-caps text-ras-on-surface-variant">
                        {filteredMembers.length} MEMBERS
                    </span>
                </div>

                {/* List header */}
                <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ras-outline-variant bg-ras-surface py-2">
                    <span className="text-ras-label-caps text-ras-on-surface-variant">MEMBER DETAILS</span>
                    <span className="text-ras-label-caps text-ras-on-surface-variant">STATUS</span>
                </div>

                {/* Member list */}
                <div className="flex flex-col">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <span className="text-ras-body-md text-ras-on-surface-variant">No members match.</span>
                        </div>
                    ) : (
                        filteredMembers.map((m) => (
                            <MemberRow
                                key={m.id}
                                member={m}
                                state={states.get(m.id) ?? null}
                                onSet={(next) => setState(m.id, next)}
                            />
                        ))
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center border-t border-ras-outline-variant bg-ras-surface-container-lowest p-4 shadow-[0px_-4px_20px_rgba(27,43,72,0.08)]">
                <button
                    type="button"
                    disabled={saving}
                    onClick={onSave}
                    className="flex w-full max-w-lg items-center justify-center gap-3 rounded-ras-xl bg-ras-primary py-4 text-ras-title-sm uppercase tracking-wider text-ras-on-primary transition-all active:scale-[0.98] disabled:opacity-60"
                >
                    <Save className="size-5" />
                    {saving ? "Saving..." : "Save Attendance"}
                </button>
            </div>
        </div>
    );
}
