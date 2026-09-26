// Shared formatting helpers for member display — used by the list, profile, and tab pages.

import type { Member } from "@/lib/sheets";

const AVATAR_PALETTE = [
    { bg: "bg-ras-primary-fixed", text: "text-ras-primary" },
    { bg: "bg-ras-secondary-fixed-dim", text: "text-ras-on-secondary-fixed" },
    { bg: "bg-ras-tertiary-fixed", text: "text-ras-tertiary" },
    { bg: "bg-ras-surface-container-highest", text: "text-ras-on-surface" },
];

export function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

export function avatarPalette(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[hash];
}

const MONTH_ABBR = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseDdMmYyyy(value: string): { day: number; month: number; year: number } | null {
    const [d, m, y] = value.split("/").map(Number);
    if (!d || !m || !y) return null;
    return { day: d, month: m, year: y };
}

export function formatDayMonth(value: string): string | null {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return null;
    return `${parsed.day} ${MONTH_ABBR[parsed.month - 1]}`;
}

export function whatsappHref(phone: string): string | null {
    const digits = phone.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
}

export function calculateAge(value: string): number | null {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return null;
    const today = new Date();
    let age = today.getFullYear() - parsed.year;
    const hasHadBirthdayThisYear =
        today.getMonth() + 1 > parsed.month ||
        (today.getMonth() + 1 === parsed.month && today.getDate() >= parsed.day);
    if (!hasHadBirthdayThisYear) age--;
    return age;
}

// Caption shown under a member's name in lists: class • birthday • age.
export function memberCaption(m: Pick<Member, "group" | "date_of_birth">): string {
    const dayMonth = formatDayMonth(m.date_of_birth);
    const age = calculateAge(m.date_of_birth);
    const birthday = dayMonth ? `${dayMonth}${age !== null ? ` • ${age}y` : ""}` : null;
    return [m.group, birthday].filter(Boolean).join(" • ");
}
