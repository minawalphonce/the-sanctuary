import { useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { CirclePlus, MessagesSquare } from "lucide-react";
import { useDataStore } from "@/store/data";
import type { Admin, FollowupRecord, Member } from "@/lib/sheets";
import {
    FOLLOWUP_OUTCOME_META,
    FOLLOWUP_TYPE_META,
    formatFollowupDate,
    getFollowupHistory,
} from "@/lib/followups";
import { AdminAvatar } from "@/components/AdminAvatar";
import { AddFollowupSheet } from "@/components/AddFollowupSheet";
import { cn } from "@/lib/utils";

const UNKNOWN_ADMIN = { name: "Unknown admin", email: "", photo_url: "" };

function FollowupEntry({ record, admin }: { record: FollowupRecord; admin: Admin | undefined }) {
    const [expanded, setExpanded] = useState(false);
    const { verb, icon: Icon } = FOLLOWUP_TYPE_META[record.type];
    const outcome = FOLLOWUP_OUTCOME_META[record.outcome];
    const adminName = admin ? admin.name || admin.email : UNKNOWN_ADMIN.name;

    return (
        <li className="flex gap-4 rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4">
            <Icon className="mt-0.5 size-6 shrink-0 text-ras-secondary" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <span className="text-ras-title-sm text-ras-on-surface">{verb}</span>
                    <span
                        className={cn(
                            "shrink-0 rounded-ras-full px-2.5 py-0.5 text-ras-label-caps text-[10px]",
                            outcome.chip
                        )}
                    >
                        {outcome.label}
                    </span>
                </div>
                <span className="flex min-w-0 items-center gap-1.5 text-ras-caption text-ras-on-surface-variant">
                    <span className="shrink-0">{formatFollowupDate(record.date)}</span>
                    <span className="shrink-0">•</span>
                    <AdminAvatar admin={admin ?? UNKNOWN_ADMIN} className="size-5" />
                    <span className="truncate">{adminName}</span>
                </span>
                {record.notes && (
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        aria-expanded={expanded}
                        className={cn(
                            "mt-1 whitespace-pre-wrap text-left text-ras-body-md text-ras-on-surface",
                            !expanded && "line-clamp-2"
                        )}
                    >
                        {record.notes}
                    </button>
                )}
            </div>
        </li>
    );
}

export default function MemberHistory() {
    const { member } = useOutletContext<{ member: Member }>();
    const followup = useDataStore((s) => s.followup);
    const admins = useDataStore((s) => s.admins);
    const [addOpen, setAddOpen] = useState(false);

    const history = useMemo(() => getFollowupHistory(followup, member.id), [followup, member.id]);
    const adminsById = useMemo(() => new Map(admins.map((a) => [a.id, a])), [admins]);

    return (
        <div className="pb-24">
            <h2 className="mb-ras-stack text-ras-headline-md text-ras-primary">Follow-up History</h2>

            {history.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-ras-secondary-container text-ras-on-secondary-container">
                        <MessagesSquare className="size-6" />
                    </div>
                    <span className="text-ras-body-md text-ras-on-surface-variant">No contact logged yet</span>
                </div>
            ) : (
                <ul className="space-y-ras-stack">
                    {history.map((record) => (
                        <FollowupEntry key={record.id} record={record} admin={adminsById.get(record.admin_id)} />
                    ))}
                </ul>
            )}

            <div className="fixed inset-x-0 bottom-0 z-40 px-ras-edge pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-ras-xl bg-ras-primary-container text-ras-title-sm text-ras-on-primary shadow-lg transition-transform active:scale-[0.98]"
                >
                    <CirclePlus className="size-5" />
                    Add Follow-up
                </button>
            </div>

            <AddFollowupSheet open={addOpen} onOpenChange={setAddOpen} member={member} />
        </div>
    );
}
