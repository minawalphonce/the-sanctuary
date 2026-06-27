// The weekday the regular session ("Lesson") recurs on, configured via
// VITE_REGULAR_SESSION_WEEKDAY (0=Sunday ... 6=Saturday). Defaults to
// Saturday if unset/invalid.
const WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function regularSessionWeekday(): number {
    const raw = (import.meta.env.VITE_REGULAR_SESSION_WEEKDAY as string | undefined)?.trim().toLowerCase();
    if (!raw) return 6;
    const byName = WEEKDAY_NAMES.indexOf(raw);
    if (byName !== -1) return byName;
    const byNumber = Number(raw);
    if (Number.isInteger(byNumber) && byNumber >= 0 && byNumber <= 6) return byNumber;
    return 6;
}

// Today if today is the configured weekday, otherwise the next upcoming one.
export function nextRegularSessionDate(): Date {
    const weekday = regularSessionWeekday();
    const d = new Date();
    const daysUntil = (weekday - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + daysUntil);
    return d;
}

export function nextRegularSessionIso(): string {
    return nextRegularSessionDate().toISOString().slice(0, 10);
}

export function nextRegularSessionDdMmYyyy(): string {
    const d = nextRegularSessionDate();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
}

// Only one session (regular or special) may exist per date. `excludeId` lets
// an edit flow check against everything except the session being edited.
export function findSessionDateCollision<T extends { id: string; date: string }>(
    sessions: T[],
    date: string,
    excludeId?: string
): T | undefined {
    if (!date) return undefined;
    return sessions.find((s) => s.date === date && s.id !== excludeId);
}
