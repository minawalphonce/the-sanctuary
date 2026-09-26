// Read helpers over the `assignments` history — the single source of truth for
// who is responsible for each member. Pure functions over store arrays so
// components can subscribe to `assignments` and re-render on change.

import type { Assignment, Member } from "@/lib/sheets";

// The member's open row (empty `to`), or null if unassigned.
export function getCurrentAssignment(assignments: Assignment[], memberId: string): Assignment | null {
    return assignments.find((a) => a.member_id === memberId && !a.to) ?? null;
}

// All rows for the member, newest first.
export function getAssignmentHistory(assignments: Assignment[], memberId: string): Assignment[] {
    return assignments
        .filter((a) => a.member_id === memberId)
        .sort((a, b) => b.from.localeCompare(a.from));
}

// Active members whose current assignment is this admin.
export function getMembersAssignedTo(members: Member[], assignments: Assignment[], adminId: string): Member[] {
    const current = currentAssignmentsByMember(assignments);
    return members.filter((m) => m.active && current.get(m.id)?.admin_id === adminId);
}

// member_id → current assignment, for list screens that look up many members.
export function currentAssignmentsByMember(assignments: Assignment[]): Map<string, Assignment> {
    const map = new Map<string, Assignment>();
    for (const a of assignments) {
        if (!a.to) map.set(a.member_id, a);
    }
    return map;
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ISO timestamp → "12 Sep 2026".
export function formatAssignmentDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}
