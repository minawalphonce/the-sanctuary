import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { MessageCircle, NotebookPen, Phone, Plus, Search, UserPlus } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { currentAssignmentsByMember } from "@/lib/assignments";
import {
    FOLLOWUP_GROUP_META,
    FOLLOWUP_GROUP_ORDER,
    followupPriority,
    type FollowupGroup,
    type FollowupPriority,
} from "@/lib/followups";
import { whatsappHref } from "@/lib/member";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/components/MemberAvatar";
import { AddFollowupSheet } from "@/components/AddFollowupSheet";
import { MemberPickerSheet } from "@/components/MemberPickerSheet";

function FollowupCard({
    member,
    priority,
    onLog,
}: {
    member: Member;
    priority: FollowupPriority;
    onLog: () => void;
}) {
    const navigate = useNavigate();
    const meta = FOLLOWUP_GROUP_META[priority.group];
    const whatsapp = member.phone ? whatsappHref(member.phone) : null;
    const note = priority.latest?.notes;

    return (
        <div
            onClick={() => navigate(`/members/${member.id}`)}
            className="cursor-pointer space-y-4 rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4 shadow-sm transition-colors hover:bg-ras-surface-container-low"
        >
            <div className="flex items-start gap-4">
                <MemberAvatar name={member.full_name} photoUrl={member.photo_url} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-ras-title-sm text-ras-on-surface">{member.full_name}</span>
                        <span
                            className={cn(
                                "shrink-0 rounded-ras-full px-2.5 py-0.5 text-ras-label-caps text-[10px]",
                                meta.chipClass
                            )}
                        >
                            {priority.chip}
                        </span>
                    </div>
                    {member.group && (
                        <span className="text-ras-caption text-ras-on-surface-variant">{member.group}</span>
                    )}
                    <span className="mt-0.5 text-ras-body-md text-ras-on-surface-variant">{priority.reason}</span>
                </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                    href={member.phone ? `tel:${member.phone}` : undefined}
                    aria-disabled={!member.phone}
                    className={cn(
                        "flex h-12 flex-1 items-center justify-center gap-2 rounded-ras-lg bg-ras-primary text-ras-label-caps text-ras-on-primary transition-transform active:scale-[0.98]",
                        !member.phone && "pointer-events-none opacity-40"
                    )}
                >
                    <Phone className="size-5" />
                    Call now
                </a>
                <a
                    href={whatsapp ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    aria-disabled={!whatsapp}
                    className={cn(
                        "flex size-12 items-center justify-center rounded-ras-lg border border-ras-outline-variant text-ras-primary transition-colors hover:bg-ras-surface-container-high",
                        !whatsapp && "pointer-events-none opacity-40"
                    )}
                >
                    <MessageCircle className="size-5" />
                </a>
                <button
                    type="button"
                    onClick={onLog}
                    className="flex h-12 items-center justify-center gap-2 rounded-ras-lg border border-ras-secondary px-4 text-ras-label-caps text-ras-secondary transition-colors hover:bg-ras-secondary-fixed/30"
                >
                    <NotebookPen className="size-5" />
                    Log
                </button>
            </div>

            {note && (
                <p className="line-clamp-3 rounded-ras-lg border-l-4 border-ras-secondary bg-ras-surface-container-low px-4 py-3 text-ras-body-md italic text-ras-on-surface-variant">
                    “{note}”
                </p>
            )}
        </div>
    );
}

export default function Followup() {
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const assignments = useDataStore((s) => s.assignments);
    const followup = useDataStore((s) => s.followup);
    const sessions = useDataStore((s) => s.sessions);
    const attendance = useDataStore((s) => s.attendance);

    const [user, setUser] = useState<User | null>(auth.currentUser);
    useEffect(() => onAuthStateChanged(auth, setUser), []);
    const uid = user?.uid ?? "";

    const [search, setSearch] = useState("");
    const [logFor, setLogFor] = useState<Member | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    // Active members currently assigned to me, with their priority.
    const mine = useMemo(() => {
        const current = currentAssignmentsByMember(assignments);
        const today = new Date();
        return members
            .filter((m) => m.active && current.get(m.id)?.admin_id === uid)
            .map((member) => ({
                member,
                priority: followupPriority(member, followup, sessions, attendance, current.get(member.id) ?? null, today),
            }));
    }, [members, assignments, followup, sessions, attendance, uid]);

    // Grouped in priority order; oldest last contact first within each group.
    const grouped = useMemo(() => {
        const query = search.trim().toLowerCase();
        const map = new Map<FollowupGroup, typeof mine>();
        for (const row of mine) {
            if (query && !row.member.full_name.toLowerCase().includes(query)) continue;
            if (!map.has(row.priority.group)) map.set(row.priority.group, []);
            map.get(row.priority.group)!.push(row);
        }
        for (const rows of map.values()) {
            rows.sort(
                (a, b) =>
                    a.priority.lastContactValue - b.priority.lastContactValue ||
                    a.member.full_name.localeCompare(b.member.full_name)
            );
        }
        return FOLLOWUP_GROUP_ORDER.filter((g) => map.has(g)).map((g) => [g, map.get(g)!] as const);
    }, [mine, search]);

    return (
        <div className="flex h-full flex-col">
            {mine.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-ras-edge text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-ras-secondary-container text-ras-on-secondary-container">
                        <MessageCircle className="size-6" />
                    </div>
                    <span className="text-ras-body-md text-ras-on-surface-variant">No members assigned to you yet</span>
                    <button
                        type="button"
                        onClick={() => navigate("/assign")}
                        className="mt-2 flex items-center gap-2 rounded-ras-full bg-ras-primary px-5 py-2 text-ras-label-caps text-ras-on-primary transition-transform active:scale-95"
                    >
                        <UserPlus className="size-4" />
                        Assign Follow-up
                    </button>
                </div>
            ) : (
                <div className="flex-1 space-y-ras-section overflow-y-auto px-ras-edge pt-4 pb-24">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ras-on-surface-variant" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder={`Search my ${mine.length} members...`}
                            className="h-12 w-full rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-low pl-11 pr-4 text-ras-body-md outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ras-primary"
                        />
                    </div>

                    {grouped.length === 0 && (
                        <p className="py-12 text-center text-ras-body-md text-ras-on-surface-variant">
                            No members match your search.
                        </p>
                    )}

                    {grouped.map(([group, rows]) => (
                        <section key={group} className="space-y-ras-stack">
                            <div className="flex items-center justify-between">
                                <h2 className="text-ras-title-sm text-ras-primary">{FOLLOWUP_GROUP_META[group].title}</h2>
                                <span className="text-ras-label-caps text-ras-on-surface-variant">{rows.length}</span>
                            </div>
                            {rows.map(({ member, priority }) => (
                                <FollowupCard
                                    key={member.id}
                                    member={member}
                                    priority={priority}
                                    onLog={() => setLogFor(member)}
                                />
                            ))}
                        </section>
                    ))}
                </div>
            )}

            {/* Log a contact for any member */}
            <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label="Add follow-up"
                className="fixed bottom-24 right-6 z-50 flex size-14 items-center justify-center rounded-ras-xl bg-ras-primary text-ras-on-primary shadow-[0px_4px_20px_rgba(27,43,72,0.2)] transition-transform active:scale-95"
            >
                <Plus className="size-6" />
            </button>

            <MemberPickerSheet open={pickerOpen} onOpenChange={setPickerOpen} onPick={setLogFor} />
            {logFor && (
                <AddFollowupSheet
                    open={!!logFor}
                    onOpenChange={(open) => !open && setLogFor(null)}
                    member={logFor}
                />
            )}
        </div>
    );
}
