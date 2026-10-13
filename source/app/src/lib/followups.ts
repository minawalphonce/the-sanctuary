// Display metadata for follow-up types and outcomes — shared by the Add
// Follow-up sheet and the member's follow-up history so they stay in sync.

import { MessageSquareText, Phone, Users, type LucideIcon } from "lucide-react";
import type { Assignment, AttendanceRecord, FollowupOutcome, FollowupRecord, FollowupType, Member, SessionRecord } from "@/lib/sheets";
import { parseDdMmYyyy } from "@/lib/member";
import { formatDate, formatRelativeDays } from "@/i18n/format";

// Labels are translated by each screen (the keys are the values stored in the sheet).
export const FOLLOWUP_TYPE_META: Record<FollowupType, { icon: LucideIcon }> = {
    call: { icon: Phone },
    message: { icon: MessageSquareText },
    "in person": { icon: Users },
};

// Chip colours per DESIGN.md: coming positive (same green as attendance
// "present"), not coming / no answer warning (gold), other muted.
export const FOLLOWUP_OUTCOME_META: Record<FollowupOutcome, { chip: string }> = {
    coming: { chip: "bg-green-100 text-green-800" },
    "not coming": { chip: "bg-ras-secondary-fixed text-ras-on-secondary-fixed-variant" },
    "no answer": { chip: "bg-ras-secondary-fixed text-ras-on-secondary-fixed-variant" },
    other: { chip: "bg-ras-surface-container-highest text-ras-on-surface-variant" },
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

// DD/MM/YYYY → "20 Oct 2026" (in the active language).
export function formatFollowupDate(ddMmYyyy: string): string {
    const p = parseDdMmYyyy(ddMmYyyy);
    return p ? formatDate(new Date(p.year, p.month - 1, p.day)) : ddMmYyyy;
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
// Group titles are translated by the Follow-up screen (keyed by group id).
export const FOLLOWUP_GROUP_META: Record<FollowupGroup, { chipClass: string }> = {
    birthday: { chipClass: "bg-ras-secondary-container text-ras-on-secondary-container" },
    "not-contacted": { chipClass: "bg-ras-error-container text-ras-on-error-container" },
    "missed-after-coming": { chipClass: "bg-ras-error-container text-ras-on-error-container" },
    "no-answer": { chipClass: "bg-ras-secondary-fixed text-ras-on-secondary-fixed-variant" },
    coming: { chipClass: "bg-green-100 text-green-800" },
    other: { chipClass: "bg-ras-surface-container-highest text-ras-on-surface-variant" },
};

export const FOLLOWUP_GROUP_ORDER = Object.keys(FOLLOWUP_GROUP_META) as FollowupGroup[];

export interface FollowupPriority {
    group: FollowupGroup;
    // Translation keys (relative to the Follow-up screen's prefix) for the row's
    // chip — may differ from the group's (e.g. "notComing") — and its reason line.
    chipKey: string;
    reasonKey: string;
    reasonParams: Record<string, string>;
    latest: FollowupRecord | null;
    // yyyymmdd of the latest contact, 0 if never contacted — for "oldest last contact first".
    lastContactValue: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function valueOf(d: Date): number {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function dateFromValue(v: number): Date {
    return new Date(Math.floor(v / 10000), Math.floor((v % 10000) / 100) - 1, v % 100);
}

function shortDate(v: number): string {
    return formatDate(dateFromValue(v), { day: "numeric", month: "short" });
}

function daysAgo(v: number, today: Date): string {
    const days = Math.max(Math.round((dateFromValue(valueOf(today)).getTime() - dateFromValue(v).getTime()) / DAY_MS), 0);
    return formatRelativeDays(days);
}

// Weekday name if the member's birthday falls Monday–Sunday of `today`'s week.
function birthdayThisWeek(dateOfBirth: string, today: Date): string | null {
    const dob = parseDdMmYyyy(dateOfBirth);
    if (!dob) return null;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        if (d.getMonth() + 1 === dob.month && d.getDate() === dob.day) return formatDate(d, { weekday: "long" });
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
        return { ...base, group: "birthday", chipKey: "chips.birthday", reasonKey: "reasons.birthday", reasonParams: { weekday: birthday } };
    }

    // 2. Not contacted since the current assignment started
    const assignedValue = assignment ? valueOf(new Date(assignment.from)) : 0;
    if (!latest || lastContactValue < assignedValue) {
        return {
            ...base,
            group: "not-contacted",
            chipKey: "chips.notContacted",
            reasonKey: assignment ? "reasons.assignedNotContacted" : "reasons.notContacted",
            reasonParams: assignment ? { date: shortDate(assignedValue) } : {},
        };
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
                chipKey: "chips.didntCome",
                reasonKey: "reasons.missedAfterComing",
                reasonParams: { coming: shortDate(lastContactValue), missed: shortDate(missed.value) },
            };
        }
        // 5. Coming, no session missed since
        return { ...base, group: "coming", chipKey: "chips.coming", reasonKey: "reasons.saidComing", reasonParams: { date: shortDate(lastContactValue) } };
    }

    // 4. No answer / not coming
    if (latest.outcome === "no answer" || latest.outcome === "not coming") {
        const noAnswer = latest.outcome === "no answer";
        return {
            ...base,
            group: "no-answer",
            chipKey: noAnswer ? "chips.noAnswer" : "chips.notComing",
            reasonKey: noAnswer ? "reasons.noAnswerAgo" : "reasons.notComingAgo",
            reasonParams: { when },
        };
    }

    // 6. Other — typically a missing or wrong number
    return { ...base, group: "other", chipKey: "chips.other", reasonKey: "reasons.otherAgo", reasonParams: { when } };
}
