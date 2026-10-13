import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { Phone, MessageCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { formatDdMmYyyy, parseDdMmYyyy } from "@/lib/member";
import { initials, avatarPalette, whatsappHref } from "@/lib/member";
import { cn } from "@/lib/utils";

const DASHBOARD_TOP_X = Number(import.meta.env.VITE_DASHBOARD_TOP_X as string) || 5;
const DASHBOARD_MAX_ROWS = 3;
const DASHBOARD_LAST_Y = Number(import.meta.env.VITE_DASHBOARD_LAST_Y as string) || 8;

function dateValue(value: string): number {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return 0;
    return parsed.year * 10000 + parsed.month * 100 + parsed.day;
}

function dateValueFromDate(d: Date): number {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function todayValue(): number {
    return dateValueFromDate(new Date());
}

function MemberAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
    if (photoUrl) {
        return <img src={photoUrl} alt={name} className="size-10 shrink-0 rounded-full object-cover" />;
    }
    const palette = avatarPalette(name);
    return (
        <div
            className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full text-ras-title-sm",
                palette.bg,
                palette.text
            )}
        >
            {initials(name)}
        </div>
    );
}

function MemberRow({ member, subtitle }: { member: Member; subtitle: string }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/members/${member.id}`)}
            className="flex cursor-pointer items-center justify-between gap-3 p-ras-list-item transition-colors hover:bg-ras-surface-container"
        >
            <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar name={member.full_name} photoUrl={member.photo_url} />
                <div className="min-w-0">
                    <p className="truncate text-ras-body-md font-semibold text-ras-primary">{member.full_name}</p>
                    <p className="truncate text-ras-caption text-ras-on-surface-variant">{subtitle}</p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <a
                    href={member.phone ? `tel:${member.phone}` : undefined}
                    onClick={(e) => e.stopPropagation()}
                    aria-disabled={!member.phone}
                    className={cn(
                        "flex size-9 items-center justify-center rounded-full text-ras-secondary transition-colors",
                        member.phone ? "hover:bg-ras-surface-container-high" : "pointer-events-none opacity-40"
                    )}
                >
                    <Phone className="size-4.5" />
                </a>
                <a
                    href={member.phone ? whatsappHref(member.phone) ?? undefined : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-disabled={!member.phone}
                    className={cn(
                        "flex size-9 items-center justify-center rounded-full text-ras-secondary transition-colors",
                        member.phone ? "hover:bg-ras-surface-container-high" : "pointer-events-none opacity-40"
                    )}
                >
                    <MessageCircle className="size-4.5" />
                </a>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { t } = useTranslation(undefined, { keyPrefix: "dashboard.home" });
    const members = useDataStore((s) => s.members);
    const attendance = useDataStore((s) => s.attendance);
    const sessions = useDataStore((s) => s.sessions);
    const assignments = useDataStore((s) => s.assignments);
    const [user, setUser] = useState<User | null>(auth.currentUser);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    const uid = user?.uid ?? "";
    const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? "";

    // Section 1: members assigned to the signed-in admin, falling back to
    // the top-X members with the most consecutive missed sessions (looking
    // back over the last Y sessions) when nobody is assigned.
    const assignedMembers = useMemo(() => {
        const mine = new Set(
            assignments.filter((a) => !a.to && a.admin_id === uid).map((a) => a.member_id)
        );
        return members.filter((m) => m.active && mine.has(m.id));
    }, [members, assignments, uid]);

    const recentSessionDates = useMemo(() => {
        const today = todayValue();
        return Array.from(new Set(sessions.filter((s) => dateValue(s.date) <= today).map((s) => s.date)))
            .sort((a, b) => dateValue(b) - dateValue(a))
            .slice(0, DASHBOARD_LAST_Y);
    }, [sessions]);

    const mostMissedMembers = useMemo(() => {
        if (assignedMembers.length > 0 || recentSessionDates.length === 0) return [];
        const presentDates = new Map<string, Set<string>>();
        for (const a of attendance) {
            if (!a.present || !recentSessionDates.includes(a.date)) continue;
            if (!presentDates.has(a.member_id)) presentDates.set(a.member_id, new Set());
            presentDates.get(a.member_id)!.add(a.date);
        }

        return members
            .filter((m) => m.active)
            .map((member) => {
                const present = presentDates.get(member.id) ?? new Set<string>();
                let consecutiveMissed = 0;
                for (const date of recentSessionDates) {
                    if (present.has(date)) break;
                    consecutiveMissed++;
                }
                return { member, consecutiveMissed };
            })
            .filter((m) => m.consecutiveMissed > 0)
            .sort((a, b) => b.consecutiveMissed - a.consecutiveMissed)
            .slice(0, DASHBOARD_TOP_X);
    }, [assignedMembers.length, members, attendance, recentSessionDates]);

    // Section 2: today's session if one exists, otherwise the most recent
    // past session — with attendance count and capacity.
    const statusSession = useMemo(() => {
        const today = todayValue();
        const todaySession = sessions.find((s) => dateValue(s.date) === today);
        if (todaySession) return { session: todaySession, isToday: true };

        const past = [...sessions]
            .filter((s) => dateValue(s.date) < today)
            .sort((a, b) => dateValue(b.date) - dateValue(a.date));
        return past.length > 0 ? { session: past[0], isToday: false } : null;
    }, [sessions]);

    const activeMemberCount = useMemo(() => members.filter((m) => m.active).length, [members]);

    const statusCount = useMemo(() => {
        if (!statusSession) return 0;
        return attendance.filter((a) => a.date === statusSession.session.date && a.present).length;
    }, [attendance, statusSession]);

    const visibleMembers = assignedMembers.length > 0
        ? assignedMembers.slice(0, DASHBOARD_MAX_ROWS).map((member) => ({ member, subtitle: member.group || "—" }))
        : mostMissedMembers.slice(0, DASHBOARD_MAX_ROWS).map(({ member, consecutiveMissed }) => ({
              member,
              subtitle: t("needsFollowup.missedInARow", { count: consecutiveMissed }),
          }));
    const percent =
        activeMemberCount > 0 ? Math.min(100, Math.round((statusCount / activeMemberCount) * 100)) : 0;

    return (
        <div className="space-y-6 px-ras-edge py-ras-section pb-24">
            <h1 className="text-ras-display-lg text-ras-primary">
                {firstName ? t("welcome", { name: firstName }) : t("welcomeNoName")}
            </h1>

            <section className="space-y-3">
                <h2 className="text-ras-title-sm text-ras-primary">
                    {assignedMembers.length > 0 ? t("assigned.title") : t("needsFollowup.title")}
                </h2>
                <div className="overflow-hidden rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest">
                    {visibleMembers.length > 0 ? (
                        <div className="divide-y divide-ras-outline-variant">
                            {visibleMembers.map(({ member, subtitle }) => (
                                <MemberRow key={member.id} member={member} subtitle={subtitle} />
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-center text-ras-caption text-ras-on-surface-variant">
                            {t("empty.noAssignedNoMissed")}
                        </p>
                    )}
                </div>
            </section>

            {statusSession && (
                <section className="space-y-2 rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4">
                    <div className="flex items-baseline justify-between">
                        <span className="text-ras-label-caps text-ras-on-surface-variant">
                            {statusSession.isToday ? t("summary.today") : t("summary.last")} ·{" "}
                            {formatDdMmYyyy(statusSession.session.date)}
                        </span>
                        <span className="text-ras-title-sm text-ras-primary">
                            {statusCount}
                            <span className="text-ras-caption text-ras-on-surface-variant"> / {activeMemberCount}</span>
                        </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-ras-surface-container">
                        <div className="h-full bg-ras-secondary" style={{ width: `${percent}%` }} />
                    </div>
                </section>
            )}
        </div>
    );
}
