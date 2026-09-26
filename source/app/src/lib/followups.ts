// Display metadata for follow-up types and outcomes — shared by the Add
// Follow-up sheet and the member's follow-up history so they stay in sync.

import { MessageSquareText, Phone, Users, type LucideIcon } from "lucide-react";
import type { FollowupOutcome, FollowupRecord, FollowupType } from "@/lib/sheets";
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
