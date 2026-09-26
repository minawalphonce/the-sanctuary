// Display metadata for follow-up types and outcomes — shared by the Add
// Follow-up sheet and the member's follow-up history so they stay in sync.

import { MessageSquareText, Phone, Users, type LucideIcon } from "lucide-react";
import type { Assignment, AttendanceRecord, FollowupOutcome, FollowupRecord, FollowupType, Member, SessionRecord } from "@/lib/sheets";
import { parseDdMmYyyy } from "@/lib/member";

export const FOLLOWUP_TYPE_META: Record<FollowupType, { label: string; verb: string; icon: LucideIcon }> = {
    call: { label: "Call", verb: "Called", icon: Phone },
    message: { label: "Message", verb: "Messaged", icon: MessageSquareText },
    "in person": { label: "In person", verb: "Spoke in person", icon: Users },
};

// Chip colours per DESIGN.md: coming positive (same green as attendance
// "present"), not coming / no answer warning (gold), other muted.
export const FOLLOWUP_OUTCOME_META: Record<FollowupOutcome, { label: string; chip: string }> = {
    coming: { label: "Coming", chip: "bg-green-100 text-green-800" },
    "not coming": { label: "Not coming", chip: "bg-ras-secondary-fixed text-ras-on-secondary-fixed-variant" },
    "no answer": { label: "No answer", chip: "bg-ras-secondary-fixed text-ras-on-secondary-fixed-variant" },
    other: { label: "Other", chip: "bg-ras-surface-container-highest text-ras-on-surface-variant" },
};

export const FOLLOWUP_TYPES = Object.keys(FOLLOWUP_TYPE_META) as FollowupType[];
export const FOLLOWUP_OUTCOMES = Object.keys(FOLLOWUP_OUTCOME_META) as FollowupOutcome[];

function dateValue(ddMmYyyy: string): number {
    const p = parseDdMmYyyy(ddMmYyyy);
    return p ? p.year * 10000 + p.month * 100 + p.day : 0;
}

// A member's contacts, newest first — by contact date, then by when logged.
export function getFollowupHistory(followups: FollowupRecord[], memberId: string): FollowupRecord[] {
    return followups
        .filter((f) => f.member_id === memberId)
        .sort((a, b) => dateValue(b.date) - dateValue(a.date) || b.timestamp.localeCompare(a.timestamp));
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// DD/MM/YYYY → "20 Oct 2026".
export function formatFollowupDate(ddMmYyyy: string): string {
    const p = parseDdMmYyyy(ddMmYyyy);
    return p ? `${p.day} ${MONTH_ABBR[p.month - 1]} ${p.year}` : ddMmYyyy;
}

// --- My follow-ups prioritisation ---

export type FollowupGroup =
    | "birthday"
    | "not-contacted"
    | "missed-after-coming"
    | "no-answer"
    | "coming"
    | "other";

// In display order — a member lands in the first group that matches.
export const FOLLOWUP_GROUP_META: Record<FollowupGroup, { title: string; chip: string; chipClass: string }> = {
    birthday: { title: "Birthday this week", chip: "Birthday", chipClass: "bg-ras-secondary-container text-ras-on-secondary-container" },
    "not-contacted": { title: "Not contacted yet", chip: "Not contacted", chipClass: "bg-ras-error-container text-ras-on-error-container" },
    "missed-after-coming": { title: "Said coming, didn't come", chip: "Didn't come", chipClass: "bg-ras-error-container text-ras-on-error-container" },
    "no-answer": { title: "No answer / not coming", chip: "No answer", chipClass: "bg-ras-secondary-fixed text-ras-on-secondary-fixed-variant" },
    coming: { title: "Coming", chip: "Coming", chipClass: "bg-green-100 text-green-800" },
    other: { title: "Other", chip: "Other", chipClass: "bg-ras-surface-container-highest text-ras-on-surface-variant" },
};

export const FOLLOWUP_GROUP_ORDER = Object.keys(FOLLOWUP_GROUP_META) as FollowupGroup[];

export interface FollowupPriority {
    group: FollowupGroup;
    // Short label for the row's chip — may differ from the group's (e.g. "Not coming").
    chip: string;
    reason: string;
    latest: FollowupRecord | null;
    // yyyymmdd of the latest contact, 0 if never contacted — for "oldest last contact first".
    lastContactValue: number;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MS = 24 * 60 * 60 * 1000;

function valueOf(d: Date): number {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function dateFromValue(v: number): Date {
    return new Date(Math.floor(v / 10000), Math.floor((v % 10000) / 100) - 1, v % 100);
}

function shortDate(v: number): string {
    const d = dateFromValue(v);
    return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

function daysAgo(v: number, today: Date): string {
    const days = Math.max(Math.round((dateFromValue(valueOf(today)).getTime() - dateFromValue(v).getTime()) / DAY_MS), 0);
    return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

// Weekday name if the member's birthday falls Monday–Sunday of `today`'s week.
function birthdayThisWeek(dateOfBirth: string, today: Date): string | null {
    const dob = parseDdMmYyyy(dateOfBirth);
    if (!dob) return null;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        if (d.getMonth() + 1 === dob.month && d.getDate() === dob.day) return WEEKDAYS[d.getDay()];
    }
    return null;
}

// Where a member sits in My follow-ups, and why. Pure so the dashboard can
// reuse it. "Latest" contact is from any admin, by date then timestamp.
export function followupPriority(
    member: Member,
    followups: FollowupRecord[],
    sessions: SessionRecord[],
    attendance: AttendanceRecord[],
    assignment: Assignment | null,
    today: Date = new Date()
): FollowupPriority {
    const history = getFollowupHistory(followups, member.id);
    const latest = history[0] ?? null;
    const lastContactValue = latest ? dateValue(latest.date) : 0;
    const base = { latest, lastContactValue };

    // 1. Birthday this week
    const birthday = birthdayThisWeek(member.date_of_birth, today);
    if (birthday) {
        return { ...base, group: "birthday", chip: "Birthday", reason: `Birthday ${birthday}` };
    }

    // 2. Not contacted since the current assignment started
    const assignedValue = assignment ? valueOf(new Date(assignment.from)) : 0;
    if (!latest || lastContactValue < assignedValue) {
        const reason = assignment ? `Assigned ${shortDate(assignedValue)} · not contacted yet` : "Not contacted yet";
        return { ...base, group: "not-contacted", chip: "Not contacted", reason };
    }

    const when = daysAgo(lastContactValue, today);

    if (latest.outcome === "coming") {
        // 3. Said coming, then missed a session dated after that contact
        const todayValue = valueOf(today);
        const present = new Set(
            attendance.filter((a) => a.member_id === member.id && a.present).map((a) => a.date)
        );
        // Today's session only counts once attendance has been taken for it.
        const recorded = new Set(attendance.map((a) => a.date));
        const hasPassed = (s: { date: string; value: number }) =>
            s.value < todayValue || (s.value === todayValue && recorded.has(s.date));
        const missed = Array.from(new Set(sessions.map((s) => s.date)))
            .map((d) => ({ date: d, value: dateValue(d) }))
            .filter((s) => s.value > lastContactValue && hasPassed(s) && !present.has(s.date))
            .sort((a, b) => a.value - b.value)[0];
        if (missed) {
            return {
                ...base,
                group: "missed-after-coming",
                chip: "Didn't come",
                reason: `Said coming ${shortDate(lastContactValue)} — missed ${shortDate(missed.value)}`,
            };
        }
        // 5. Coming, no session missed since
        return { ...base, group: "coming", chip: "Coming", reason: `Said coming ${shortDate(lastContactValue)}` };
    }

    // 4. No answer / not coming
    if (latest.outcome === "no answer" || latest.outcome === "not coming") {
        const label = FOLLOWUP_OUTCOME_META[latest.outcome].label;
        return { ...base, group: "no-answer", chip: label, reason: `${label} · ${when}` };
    }

    // 6. Other — typically a missing or wrong number
    return { ...base, group: "other", chip: "Other", reason: `Other · ${when}` };
}
