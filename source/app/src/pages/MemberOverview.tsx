import { useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { parseDdMmYyyy } from "@/lib/member";
import { cn } from "@/lib/utils";
import { ResponsibleAdminCard } from "@/components/ResponsibleAdminCard";

const DAY_MS = 24 * 60 * 60 * 1000;
const STREAK_SESSIONS = 14;

// Attendance/session dates are stored as dd/mm/yyyy strings (see lib/sessions.ts).
function ddMmYyyyToDate(value: string): Date | null {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return null;
    const d = new Date(parsed.year, parsed.month - 1, parsed.day);
    return Number.isNaN(d.getTime()) ? null : d;
}

function dateValue(value: string): number {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return 0;
    return parsed.year * 10000 + parsed.month * 100 + parsed.day;
}

function dateValueFromDate(d: Date): number {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function formatDate(d: Date): string {
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function MemberOverview() {
    const { member } = useOutletContext<{ member: Member }>();
    const attendance = useDataStore((s) => s.attendance);
    const sessions = useDataStore((s) => s.sessions);
    const [now] = useState(() => Date.now());

    // All sessions that have already happened (any status), oldest to
    // newest — this is the universe of sessions the member could have
    // attended. Future-dated sessions don't count yet since they haven't
    // happened.
    const allSessionDates = useMemo(() => {
        const todayValue = dateValueFromDate(new Date(now));
        const dates = new Set(sessions.filter((s) => dateValue(s.date) <= todayValue).map((s) => s.date));
        return Array.from(dates).sort((a, b) => dateValue(a) - dateValue(b));
    }, [sessions, now]);

    // Member's present/absent per session date, defaulting to absent for
    // sessions where no row exists for this member at all.
    const memberBySessionDate = useMemo(() => {
        const map = new Map(
            attendance.filter((a) => a.member_id === member.id).map((a) => [a.date, a.present])
        );
        return allSessionDates.map((date) => ({ date, present: map.get(date) ?? false }));
    }, [attendance, allSessionDates, member.id]);

    const attendanceRate = useMemo(() => {
        if (memberBySessionDate.length === 0) return null;
        const presentCount = memberBySessionDate.filter((a) => a.present).length;
        return Math.round((presentCount / memberBySessionDate.length) * 100);
    }, [memberBySessionDate]);

    const lastSession = useMemo(() => {
        const presentDates = memberBySessionDate
            .filter((a) => a.present)
            .map((a) => ddMmYyyyToDate(a.date))
            .filter((d): d is Date => d !== null)
            .sort((a, b) => b.getTime() - a.getTime());
        if (presentDates.length === 0) return null;
        const date = presentDates[0];
        const days = Math.max(Math.floor((now - date.getTime()) / DAY_MS), 0);
        return { date, days };
    }, [memberBySessionDate, now]);

    const consecutiveMissed = useMemo(() => {
        const sessionsDesc = [...memberBySessionDate].reverse();
        let count = 0;
        for (const session of sessionsDesc) {
            if (session.present) break;
            count++;
        }
        return count;
    }, [memberBySessionDate]);

    const streak = useMemo(() => memberBySessionDate.slice(-STREAK_SESSIONS), [memberBySessionDate]);

    return (
        <div className="space-y-ras-stack">
            {member.active && <ResponsibleAdminCard member={member} />}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-4">
                    <p className="mb-1 text-ras-label-caps uppercase text-ras-on-surface-variant">
                        Attendance Rate
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-ras-display-lg text-ras-primary">
                            {attendanceRate !== null ? `${attendanceRate}%` : "—"}
                        </span>
                    </div>
                </div>
                <div className="rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-4">
                    <p className="mb-1 text-ras-label-caps uppercase text-ras-on-surface-variant">
                        Last Session
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-ras-display-lg text-ras-primary">
                            {lastSession ? formatDate(lastSession.date) : "—"}
                        </span>
                    </div>
                    {lastSession && (
                        <p className="mt-1 text-ras-label-caps text-ras-on-surface-variant">
                            {lastSession.days === 0
                                ? "Today"
                                : lastSession.days === 1
                                  ? "1 day ago"
                                  : `${lastSession.days} days ago`}
                        </p>
                    )}
                </div>
            </div>

            {/* Consecutive Missed */}
            <div className="rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-4">
                <p className="mb-1 text-ras-label-caps uppercase text-ras-on-surface-variant">
                    Consecutive Sessions Missed
                </p>
                <span
                    className={cn(
                        "text-ras-display-lg",
                        consecutiveMissed > 0 ? "text-ras-error" : "text-ras-primary"
                    )}
                >
                    {consecutiveMissed}
                </span>
            </div>

            {/* Activity Streak */}
            <section className="rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-ras-title-sm text-ras-primary">Activity Streak</h3>
                    <span className="text-ras-label-caps text-ras-on-surface-variant">
                        Last {streak.length} Session{streak.length === 1 ? "" : "s"}
                    </span>
                </div>
                {streak.length === 0 ? (
                    <p className="text-ras-body-md text-ras-on-surface-variant">No sessions recorded yet.</p>
                ) : (
                    <div className="flex justify-between gap-1">
                        {streak.map((session) => (
                            <div
                                key={session.date}
                                className={cn(
                                    "h-8 flex-1 rounded",
                                    session.present ? "bg-ras-primary" : "bg-ras-error-container"
                                )}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Notes */}
            {member.notes && (
                <section className="rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-5">
                    <h3 className="mb-2 text-ras-title-sm text-ras-primary">Notes</h3>
                    <p className="whitespace-pre-wrap text-ras-body-md text-ras-on-surface-variant">
                        {member.notes}
                    </p>
                </section>
            )}
        </div>
    );
}
