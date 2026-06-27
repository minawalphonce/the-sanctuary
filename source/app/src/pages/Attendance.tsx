import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, ClipboardCheck, History, Inbox, MapPin, Pencil, PlusCircle, Sparkles } from "lucide-react";
import { useDataStore } from "@/store/data";
import { parseDdMmYyyy } from "@/lib/member";
import { cn } from "@/lib/utils";
import type { SessionRecord } from "@/lib/sheets";
import { AddSpecialSessionSheet } from "@/components/AddSpecialSessionSheet";
import { EditSpecialSessionSheet } from "@/components/EditSpecialSessionSheet";

function sessionDateValue(session: SessionRecord): number {
    const d = parseDdMmYyyy(session.date);
    if (!d) return 0;
    return d.year * 10000 + d.month * 100 + d.day;
}

function todayDateValue(): number {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

type FilterKey = "all" | "regular" | "special";

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All Sessions" },
    { key: "regular", label: "Regular" },
    { key: "special", label: "Special Events" },
];

function monthlyAttendancePercent(
    attendance: { date: string; present: boolean }[],
    activeMemberCount: number
): number | null {
    const now = new Date();
    const datesThisMonth = new Set(
        attendance
            .map((a) => parseDdMmYyyy(a.date))
            .filter((d) => d && d.month === now.getMonth() + 1 && d.year === now.getFullYear())
            .map((d) => `${d!.year}-${d!.month}-${d!.day}`)
    );
    if (datesThisMonth.size === 0 || activeMemberCount === 0) return null;

    const present = attendance.filter((a) => {
        if (!a.present) return false;
        const d = parseDdMmYyyy(a.date);
        return d && d.month === now.getMonth() + 1 && d.year === now.getFullYear();
    }).length;
    const possible = datesThisMonth.size * activeMemberCount;
    return Math.round((present / possible) * 100);
}

function SessionRow({
    session,
    attendingCount,
    isUpcoming,
    onClick,
    onEdit,
}: {
    session: SessionRecord;
    attendingCount: number;
    isUpcoming: boolean;
    onClick: (session: SessionRecord) => void;
    onEdit?: (session: SessionRecord) => void;
}) {
    const isSpecial = session.type === "special";

    return (
        <div
            onClick={() => onClick(session)}
            className={cn(
                "group flex cursor-pointer items-center justify-between gap-3 rounded-ras-xl border border-ras-outline-variant p-4 transition-colors hover:border-ras-secondary",
                isSpecial
                    ? "border-l-4 border-l-ras-secondary-container bg-ras-surface-container-low p-5"
                    : "bg-ras-surface-container-lowest/80 backdrop-blur"
            )}
        >
            <div className="flex min-w-0 items-center gap-4">
                <div
                    className={cn(
                        "flex size-12 shrink-0 items-center justify-center transition-colors",
                        isSpecial
                            ? "rounded-full bg-ras-secondary-container text-ras-on-secondary-container"
                            : "rounded-ras-lg bg-ras-primary-container text-ras-on-primary-container group-hover:bg-ras-primary"
                    )}
                >
                    <Sparkles className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="truncate text-ras-title-sm text-ras-primary">{session.name}</h4>
                        {isSpecial && (
                            <span className="shrink-0 rounded bg-ras-tertiary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ras-on-tertiary-container">
                                Special
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-ras-caption text-ras-on-surface-variant">
                        {isSpecial ? (
                            <MapPin className="size-3.5 shrink-0" />
                        ) : (
                            <CalendarDays className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{[session.date, session.notes].filter(Boolean).join(" • ")}</span>
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                    <div className="whitespace-nowrap text-ras-title-sm text-ras-primary">
                        {attendingCount} Attending
                    </div>
                    <div className="flex items-center justify-end gap-1 text-ras-caption text-ras-secondary">
                        <Sparkles className="size-3.5" />
                        {isUpcoming ? "Upcoming" : "Active"}
                    </div>
                </div>
                {isSpecial && onEdit && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(session);
                        }}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-ras-on-surface-variant transition-colors hover:bg-ras-surface-container-high hover:text-ras-primary"
                    >
                        <Pencil className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Attendance() {
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const attendance = useDataStore((s) => s.attendance);
    const sessions = useDataStore((s) => s.sessions);
    const [filter, setFilter] = useState<FilterKey>("all");
    const [addSpecialOpen, setAddSpecialOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);

    const activeMemberCount = useMemo(() => members.filter((m) => m.active).length, [members]);
    const monthlyPercent = useMemo(
        () => monthlyAttendancePercent(attendance, activeMemberCount),
        [attendance, activeMemberCount]
    );

    const attendingCountByDate = useMemo(() => {
        const map = new Map<string, number>();
        for (const a of attendance) {
            if (!a.present) continue;
            map.set(a.date, (map.get(a.date) ?? 0) + 1);
        }
        return map;
    }, [attendance]);

    const filteredSessions = useMemo(() => {
        if (filter === "regular") return sessions.filter((s) => s.type === "regular");
        if (filter === "special") return sessions.filter((s) => s.type === "special");
        return sessions;
    }, [sessions, filter]);

    const upcomingSessions = useMemo(() => {
        const todayValue = todayDateValue();
        return [...filteredSessions]
            .filter((s) => sessionDateValue(s) > todayValue)
            .sort((a, b) => sessionDateValue(a) - sessionDateValue(b));
    }, [filteredSessions]);

    const activeSessions = useMemo(() => {
        const todayValue = todayDateValue();
        return [...filteredSessions]
            .filter((s) => sessionDateValue(s) <= todayValue)
            .sort((a, b) => sessionDateValue(b) - sessionDateValue(a));
    }, [filteredSessions]);

    const hasNoSessions = upcomingSessions.length === 0 && activeSessions.length === 0;

    const onSessionClick = (session: SessionRecord) => navigate(`/attendance/take/${session.id}`);

    return (
        <div className="space-y-6 px-ras-edge py-ras-section pb-24">
            {/* Header */}
            <section className="space-y-1">
                <p className="text-ras-label-caps uppercase text-ras-secondary">Attendance Tracking</p>
                <h2 className="text-ras-display-lg text-ras-primary">Attendance Sessions</h2>
            </section>

            <div className="grid grid-cols-1 gap-ras-stack md:grid-cols-12">
                {/* Featured action card */}
                <div className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-ras-xl bg-ras-primary p-6 text-ras-on-primary shadow-lg md:col-span-8">
                    <div className="relative z-10">
                        <h3 className="text-ras-title-sm">New Special Session</h3>
                        <p className="mt-2 max-w-xs text-ras-body-md opacity-80">
                            Organizing an outing, retreat, or one-time youth event? Track attendance
                            specifically for this occasion.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAddSpecialOpen(true)}
                        className="relative z-10 mt-4 flex items-center gap-2 self-start rounded-ras-lg bg-ras-secondary-container px-6 py-2.5 text-ras-title-sm text-ras-on-secondary-container transition-all hover:opacity-90"
                    >
                        <PlusCircle className="size-5" />
                        <span>Add Special Session</span>
                    </button>
                    <div className="absolute -bottom-4 -right-4 size-32 rounded-full bg-ras-secondary opacity-20 blur-3xl" />
                </div>

                {/* Monthly stats */}
                <div className="flex flex-col justify-center rounded-ras-xl border border-ras-on-secondary-container/10 bg-ras-secondary-fixed p-6 text-ras-on-secondary-fixed md:col-span-4">
                    <div className="mb-2 flex items-center gap-3">
                        <History className="size-5 text-ras-secondary" />
                        <span className="text-ras-label-caps">Monthly Stats</span>
                    </div>
                    <div className="text-3xl font-extrabold text-ras-primary">
                        {monthlyPercent === null ? "—" : `${monthlyPercent}%`}
                    </div>
                    <p className="text-ras-caption opacity-70">
                        Average attendance across all youth programs this month.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={cn(
                            "shrink-0 rounded-ras-full px-4 py-1.5 text-ras-label-caps transition-colors",
                            filter === key
                                ? "bg-ras-primary text-ras-on-primary"
                                : "border border-ras-outline-variant bg-ras-surface-container text-ras-on-surface-variant hover:bg-ras-surface-container-high"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Sessions list */}
            <div className="space-y-6">
                {hasNoSessions ? (
                    <div className="flex flex-col items-center gap-2 py-16 text-center">
                        <Inbox className="size-8 text-ras-on-surface-variant" />
                        <span className="text-ras-body-md text-ras-on-surface-variant">No sessions yet.</span>
                    </div>
                ) : (
                    <>
                        {activeSessions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-ras-label-caps uppercase text-ras-on-surface-variant">
                                    <span className="size-1.5 rounded-full bg-ras-outline" />
                                    Active Sessions
                                </h3>
                                <div className="space-y-3">
                                    {activeSessions.map((s) => (
                                        <SessionRow
                                            key={s.id}
                                            session={s}
                                            attendingCount={attendingCountByDate.get(s.date) ?? 0}
                                            isUpcoming={false}
                                            onClick={onSessionClick}
                                            onEdit={s.type === "special" ? setEditingSession : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {upcomingSessions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-ras-label-caps uppercase text-ras-on-surface-variant">
                                    <span className="size-1.5 rounded-full bg-ras-secondary" />
                                    Upcoming Sessions
                                </h3>
                                <div className="space-y-3">
                                    {upcomingSessions.map((s) => (
                                        <SessionRow
                                            key={s.id}
                                            session={s}
                                            attendingCount={attendingCountByDate.get(s.date) ?? 0}
                                            isUpcoming
                                            onClick={onSessionClick}
                                            onEdit={s.type === "special" ? setEditingSession : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* FAB for taking attendance */}
            <button
                type="button"
                onClick={() => navigate("/attendance/take")}
                className="fixed bottom-24 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-ras-primary text-ras-on-primary shadow-[0px_4px_20px_rgba(27,43,72,0.2)] transition-transform active:scale-95"
            >
                <ClipboardCheck className="size-6" />
            </button>

            <AddSpecialSessionSheet open={addSpecialOpen} onOpenChange={setAddSpecialOpen} />
            <EditSpecialSessionSheet
                session={editingSession}
                onOpenChange={(open) => {
                    if (!open) setEditingSession(null);
                }}
            />
        </div>
    );
}
