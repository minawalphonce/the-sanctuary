import { useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const STREAK_DAYS = 14;

function isoToDate(iso: string): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function MemberOverview() {
    const { member } = useOutletContext<{ member: Member }>();
    const attendance = useDataStore((s) => s.attendance);
    const [now] = useState(() => Date.now());

    const memberAttendance = useMemo(
        () => attendance.filter((a) => a.member_id === member.id),
        [attendance, member.id]
    );

    const attendanceRate = useMemo(() => {
        if (memberAttendance.length === 0) return null;
        const presentCount = memberAttendance.filter((a) => a.present).length;
        return Math.round((presentCount / memberAttendance.length) * 100);
    }, [memberAttendance]);

    const lastSession = useMemo(() => {
        const presentDates = memberAttendance
            .filter((a) => a.present)
            .map((a) => isoToDate(a.date))
            .filter((d): d is Date => d !== null)
            .sort((a, b) => b.getTime() - a.getTime());
        if (presentDates.length === 0) return null;
        const date = presentDates[0];
        const days = Math.max(Math.floor((now - date.getTime()) / DAY_MS), 0);
        return { date, days };
    }, [memberAttendance, now]);

    const consecutiveMissed = useMemo(() => {
        const sessionsDesc = [...memberAttendance].sort((a, b) => b.date.localeCompare(a.date));
        let count = 0;
        for (const session of sessionsDesc) {
            if (session.present) break;
            count++;
        }
        return count;
    }, [memberAttendance]);

    const streak = useMemo(() => {
        const byDate = new Map(memberAttendance.map((a) => [a.date, a.present]));
        const days: { date: string; present: boolean | null }[] = [];
        for (let i = STREAK_DAYS - 1; i >= 0; i--) {
            const d = new Date(now - i * DAY_MS);
            const iso = d.toISOString().slice(0, 10);
            days.push({ date: iso, present: byDate.has(iso) ? byDate.get(iso)! : null });
        }
        return days;
    }, [memberAttendance, now]);

    return (
        <div className="space-y-ras-stack">
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
                    <span className="text-ras-label-caps text-ras-on-surface-variant">Last {STREAK_DAYS} Days</span>
                </div>
                <div className="flex justify-between gap-1">
                    {streak.map((day) => (
                        <div
                            key={day.date}
                            className={cn(
                                "h-8 flex-1 rounded",
                                day.present === true && "bg-ras-primary",
                                day.present === false && "bg-ras-error-container",
                                day.present === null && "bg-ras-outline-variant/30"
                            )}
                        />
                    ))}
                </div>
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
