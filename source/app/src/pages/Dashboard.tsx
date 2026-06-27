import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { toast } from "sonner";
import { Phone, MessageCircle, UserPlus, ClipboardCheck, Sparkles, MapPin, Inbox } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useDataStore } from "@/store/data";
import type { Member, SessionRecord } from "@/lib/sheets";
import { parseDdMmYyyy } from "@/lib/member";
import { initials, avatarPalette, whatsappHref } from "@/lib/member";
import { cn } from "@/lib/utils";

const DASHBOARD_TOP_X = Number(import.meta.env.VITE_DASHBOARD_TOP_X as string) || 5;
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
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const attendance = useDataStore((s) => s.attendance);
    const sessions = useDataStore((s) => s.sessions);
    const [user, setUser] = useState<User | null>(auth.currentUser);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    const email = user?.email ?? "";

    // Section 1: members assigned to the signed-in admin, falling back to
    // the top-X members with the most consecutive missed sessions (looking
    // back over the last Y sessions) when nobody is assigned.
    const assignedMembers = useMemo(
        () => members.filter((m) => m.active && m.assigned_to === email),
        [members, email]
    );

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

    // Section 4: next upcoming special session (future-dated, any status).
    const nextSpecialSession = useMemo(() => {
        const today = todayValue();
        return [...sessions]
            .filter((s) => s.type === "special" && dateValue(s.date) > today)
            .sort((a, b) => dateValue(a.date) - dateValue(b.date))[0] as SessionRecord | undefined;
    }, [sessions]);

    return (
        <div className="space-y-6 px-ras-edge py-ras-section pb-24">
            {/* Section 1: Assigned members / most-missed fallback */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-ras-title-sm text-ras-primary">
                        {assignedMembers.length > 0 ? "Your Assigned Members" : "Needs Follow-up"}
                    </h2>
                    <button
                        type="button"
                        onClick={() =>
                            toast.info("Coming soon", { description: "Follow-up reports aren't available yet." })
                        }
                        className="text-ras-label-caps text-ras-secondary underline"
                    >
                        View All
                    </button>
                </div>

                <div className="overflow-hidden rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest">
                    {assignedMembers.length === 0 && mostMissedMembers.length === 0 && (
                        <div className="flex items-center gap-3 p-4 bg-ras-surface-container">
                            <Inbox className="size-5 text-ras-on-surface-variant" />
                            <p className="text-ras-caption text-ras-on-surface-variant">
                                No assigned members and no one missed recent sessions.
                            </p>
                        </div>
                    )}

                    {assignedMembers.length > 0 ? (
                        <div className="divide-y divide-ras-outline-variant">
                            {assignedMembers.map((m) => (
                                <MemberRow key={m.id} member={m} subtitle={m.group || "—"} />
                            ))}
                        </div>
                    ) : (
                        mostMissedMembers.length > 0 && (
                            <>
                                <div className="flex items-center gap-3 p-4 bg-ras-surface-container">
                                    <Inbox className="size-5 text-ras-on-surface-variant" />
                                    <p className="text-ras-caption text-ras-on-surface">
                                        Top {mostMissedMembers.length} members missing recent sessions.
                                    </p>
                                </div>
                                <div className="divide-y divide-ras-outline-variant">
                                    {mostMissedMembers.map(({ member, consecutiveMissed }) => (
                                        <MemberRow
                                            key={member.id}
                                            member={member}
                                            subtitle={`Missed ${consecutiveMissed} session${consecutiveMissed === 1 ? "" : "s"} in a row`}
                                        />
                                    ))}
                                </div>
                            </>
                        )
                    )}
                </div>
            </section>

            {/* Section 2: Today's status */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-ras-title-sm text-ras-primary">
                        {statusSession?.isToday ? "Today's Summary" : "Last Session Summary"}
                    </h2>
                    {statusSession && (
                        <span className="text-ras-label-caps text-ras-on-surface-variant">
                            {statusSession.session.date}
                        </span>
                    )}
                </div>

                {statusSession ? (
                    <div className="rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-ras-label-caps uppercase text-ras-on-surface-variant">
                                {statusSession.session.name || "Session"}
                            </span>
                            <ClipboardCheck className="size-4.5 text-ras-secondary" />
                        </div>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-ras-display-lg text-ras-primary">{statusCount}</span>
                            <span className="text-ras-caption text-ras-on-surface-variant">/ {activeMemberCount}</span>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ras-surface-container">
                            <div
                                className="h-full bg-ras-secondary"
                                style={{
                                    width: `${activeMemberCount > 0 ? Math.min(100, Math.round((statusCount / activeMemberCount) * 100)) : 0}%`,
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4 text-center text-ras-caption text-ras-on-surface-variant">
                        No sessions recorded yet.
                    </div>
                )}
            </section>

            {/* Section 3: Quick Actions */}
            <section className="space-y-3">
                <h2 className="text-ras-title-sm text-ras-primary">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/members/add")}
                        className="flex items-center gap-3 rounded-ras-xl bg-ras-primary p-4 text-ras-on-primary transition-all hover:opacity-90 active:scale-95"
                    >
                        <UserPlus className="size-5" />
                        <span className="text-ras-label-caps">Add Member</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/attendance/take")}
                        className="flex items-center gap-3 rounded-ras-xl bg-ras-secondary-container p-4 text-ras-on-secondary-container transition-all hover:bg-ras-secondary-fixed active:scale-95"
                    >
                        <ClipboardCheck className="size-5" />
                        <span className="text-ras-label-caps">Take Attendance</span>
                    </button>
                </div>
            </section>

            {/* Section 4: Next upcoming special session */}
            <section className="space-y-3">
                <h2 className="text-ras-title-sm text-ras-primary">Upcoming Special Session</h2>
                {nextSpecialSession ? (
                    <div
                        onClick={() => navigate(`/attendance/take/${nextSpecialSession.id}`)}
                        className="flex cursor-pointer items-center gap-4 rounded-ras-xl border-l-4 border-l-ras-secondary-container bg-ras-surface-container-low p-5 transition-colors hover:border-ras-secondary"
                    >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ras-secondary-container text-ras-on-secondary-container">
                            <Sparkles className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-ras-title-sm text-ras-primary">{nextSpecialSession.name}</h3>
                            <div className="flex items-center gap-2 text-ras-caption text-ras-on-surface-variant">
                                <MapPin className="size-3.5 shrink-0" />
                                <span className="truncate">
                                    {[nextSpecialSession.date, nextSpecialSession.notes].filter(Boolean).join(" • ")}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4 text-center text-ras-caption text-ras-on-surface-variant">
                        No special sessions scheduled.
                    </div>
                )}
            </section>
        </div>
    );
}
