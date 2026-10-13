import i18n from "./index";
import { getLanguage } from "./languages";

// Locale used for Intl formatting (ar → ar-EG for Eastern Arabic digits).
export function intlLocale(): string {
    return getLanguage(i18n.resolvedLanguage ?? i18n.language).intlLocale;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(intlLocale(), options).format(value);
}

export function formatDate(
    value: Date | string | number,
    options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
    return new Intl.DateTimeFormat(intlLocale(), options).format(new Date(value));
}

export function formatTime(
    value: Date | string | number,
    options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" },
): string {
    return new Intl.DateTimeFormat(intlLocale(), options).format(new Date(value));
}

// "today" / "yesterday" / "3 days ago", given whole days elapsed (>= 0).
export function formatRelativeDays(daysAgo: number): string {
    return new Intl.RelativeTimeFormat(intlLocale(), { numeric: "auto" }).format(-daysAgo, "day");
}

export function formatList(items: string[], type: "conjunction" | "disjunction" = "conjunction"): string {
    return new Intl.ListFormat(intlLocale(), { style: "long", type }).format(items);
}
