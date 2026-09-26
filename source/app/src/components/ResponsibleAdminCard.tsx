import { useMemo, useState } from "react";
import { ChevronDown, UserPlus, UserRoundPen } from "lucide-react";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { getAssignmentHistory, formatAssignmentDate } from "@/lib/assignments";
import { AdminAvatar } from "@/components/AdminAvatar";
import { AssignAdminSheet } from "@/components/AssignAdminSheet";
import { cn } from "@/lib/utils";

// Who's responsible for this member, with Assign/Reassign and the past assignments.
export function ResponsibleAdminCard({ member }: { member: Member }) {
    const admins = useDataStore((s) => s.admins);
    const assignments = useDataStore((s) => s.assignments);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const history = useMemo(() => getAssignmentHistory(assignments, member.id), [assignments, member.id]);
    const current = history.find((a) => !a.to) ?? null;
    const previous = history.filter((a) => a.to);

    const adminsById = useMemo(() => new Map(admins.map((a) => [a.id, a])), [admins]);
    const currentAdmin = current ? adminsById.get(current.admin_id) : undefined;

    const adminName = (id: string) => {
        const a = adminsById.get(id);
        return a ? a.name || a.email : "Unknown admin";
    };

    return (
        <section className="rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-4">
            <p className="mb-3 text-ras-label-caps uppercase text-ras-on-surface-variant">Responsible Admin</p>

            <div className="flex items-center justify-between gap-3">
                {current ? (
                    <div className="flex min-w-0 items-center gap-3">
                        <AdminAvatar
                            admin={currentAdmin ?? { name: "Unknown admin", email: "", photo_url: "" }}
                            className="size-10"
                        />
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-ras-title-sm text-ras-primary">
                                {adminName(current.admin_id)}
                            </span>
                            <span className="text-ras-caption text-ras-on-surface-variant">
                                since {formatAssignmentDate(current.from)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-ras-title-sm font-semibold text-ras-secondary">Unassigned</span>
                )}

                <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-ras-full bg-ras-primary px-4 py-1.5 text-ras-label-caps text-ras-on-primary transition-transform active:scale-95"
                >
                    {current ? <UserRoundPen className="size-4" /> : <UserPlus className="size-4" />}
                    {current ? "Reassign" : "Assign"}
                </button>
            </div>

            {previous.length > 0 && (
                <div className="mt-4 border-t border-ras-outline-variant/50 pt-3">
                    <button
                        type="button"
                        onClick={() => setHistoryOpen((v) => !v)}
                        aria-expanded={historyOpen}
                        className="flex w-full items-center justify-between text-ras-label-caps text-ras-on-surface-variant"
                    >
                        Assignment history ({previous.length})
                        <ChevronDown className={cn("size-4 transition-transform", historyOpen && "rotate-180")} />
                    </button>
                    {historyOpen && (
                        <ul className="mt-3 space-y-3">
                            {previous.map((a) => {
                                const admin = adminsById.get(a.admin_id);
                                return (
                                    <li key={a.id} className="flex items-center gap-3">
                                        <AdminAvatar
                                            admin={admin ?? { name: "Unknown admin", email: "", photo_url: "" }}
                                            className="size-7"
                                        />
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate text-ras-body-md text-ras-on-surface">
                                                {adminName(a.admin_id)}
                                            </span>
                                            <span className="text-ras-caption text-ras-on-surface-variant">
                                                {formatAssignmentDate(a.from)} – {formatAssignmentDate(a.to)}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            <AssignAdminSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                member={member}
                currentAdminId={current?.admin_id ?? null}
            />
        </section>
    );
}
