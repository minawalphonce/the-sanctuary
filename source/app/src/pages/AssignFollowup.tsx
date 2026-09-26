import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { X, Search, ClipboardCheck, UserX, Users } from "lucide-react";
import { useDataStore } from "@/store/data";
import type { Admin, Member } from "@/lib/sheets";
import { currentAssignmentsByMember } from "@/lib/assignments";
import { cn } from "@/lib/utils";
import { memberCaption } from "@/lib/member";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MemberAvatar } from "@/components/MemberAvatar";
import { AdminPicker } from "@/components/AdminPicker";
import { AssigneeIndicator } from "@/components/AssigneeIndicator";
import { FilterChip } from "@/components/FilterChip";

type PickerFilter = "unassigned" | "all";

const checkboxClass =
    "size-6 rounded-ras-sm border-2 border-ras-outline-variant data-checked:border-ras-primary data-checked:bg-ras-primary data-checked:text-ras-on-primary [&_svg]:size-4";

function adminLabel(admin: Pick<Admin, "name" | "email">) {
    return admin.name || admin.email;
}

function firstName(admin: Pick<Admin, "name" | "email">) {
    return adminLabel(admin).split(" ")[0];
}

// "Assign 5 members to Monica. 2 will be moved from Tasoni Mary and 1 from Fr. Bishoy."
// Members already with `target` are left out of `count` and noted at the end.
function summarise(count: number, target: Admin, movedFrom: [string, number][], unchanged: number) {
    let text = `Assign ${count} ${count === 1 ? "member" : "members"} to ${adminLabel(target)}.`;
    if (movedFrom.length > 0) {
        const parts = movedFrom.map(([name, n], i) => (i === 0 ? `${n} will be moved from ${name}` : `${n} from ${name}`));
        const joined = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
        text += ` ${joined}.`;
    }
    if (unchanged > 0) {
        text += ` ${unchanged} ${unchanged === 1 ? "is" : "are"} already with ${adminLabel(target)} and won't change.`;
    }
    return text;
}

export default function AssignFollowup() {
    const navigate = useNavigate();
    const admins = useDataStore((s) => s.admins);
    const members = useDataStore((s) => s.members);
    const assignments = useDataStore((s) => s.assignments);
    const assign = useDataStore((s) => s.assign);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<PickerFilter>("unassigned");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [adminId, setAdminId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Back to wherever we came from; straight to the dashboard on a cold open.
    const close = () => {
        if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
        else navigate("/", { replace: true });
    };

    // member_id → current admin_id.
    const currentAdminId = useMemo(() => {
        const map = new Map<string, string>();
        for (const [memberId, a] of currentAssignmentsByMember(assignments)) map.set(memberId, a.admin_id);
        return map;
    }, [assignments]);

    const adminsById = useMemo(() => new Map(admins.map((a) => [a.id, a])), [admins]);

    const grouped = useMemo(() => {
        const query = search.trim().toLowerCase();
        const map = new Map<string, Member[]>();
        for (const m of members) {
            if (!m.active) continue;
            if (filter === "unassigned" && currentAdminId.has(m.id)) continue;
            if (query && !m.full_name.toLowerCase().includes(query)) continue;
            const key = m.group || "Ungrouped";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(m);
        }
        for (const rows of map.values()) rows.sort((a, b) => a.full_name.localeCompare(b.full_name));
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [members, filter, search, currentAdminId]);

    // Selection minus anyone who's already with the chosen admin — assign()
    // skips them anyway; everyone else (assigned or not) can be reassigned.
    const effective = useMemo(
        () => Array.from(selected).filter((id) => !(adminId && currentAdminId.get(id) === adminId)),
        [selected, adminId, currentAdminId]
    );

    const toggle =(memberId: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(memberId)) next.delete(memberId);
            else next.add(memberId);
            return next;
        });

    const toggleGroup = (rows: Member[], select: boolean) =>
        setSelected((prev) => {
            const next = new Set(prev);
            for (const m of rows) {
                if (select) next.add(m.id);
                else next.delete(m.id);
            }
            return next;
        });

    const target = adminId ? adminsById.get(adminId) : undefined;

    // Previous admin name → how many selected members move away from them.
    const movedFrom = useMemo(() => {
        const counts = new Map<string, number>();
        for (const memberId of effective) {
            const prevId = currentAdminId.get(memberId);
            if (!prevId) continue;
            const prev = adminsById.get(prevId);
            const name = prev ? adminLabel(prev) : "another admin";
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        return Array.from(counts.entries());
    }, [effective, currentAdminId, adminsById]);

    const onConfirm = async () => {
        if (!target) return;
        const count = effective.length;
        setConfirmOpen(false);
        setSelected(new Set());
        try {
            await assign(effective, target.id);
            toast.success(`${count} ${count === 1 ? "member" : "members"} assigned to ${adminLabel(target)}`);
        } catch (err) {
            toast.error("Could not assign members", {
                description: err instanceof Error ? err.message : undefined,
            });
        }
    };

    return (
        <div className="flex h-full flex-col bg-ras-background">
            <header className="sticky top-0 z-50 flex min-h-16 w-full shrink-0 items-center justify-between border-b border-ras-outline-variant bg-ras-surface px-ras-edge pt-[env(safe-area-inset-top)]">
                <h1 className="text-ras-headline-md font-extrabold text-ras-primary">Assign Follow-up</h1>
                <button
                    type="button"
                    onClick={close}
                    className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-ras-surface-container-high active:opacity-80"
                >
                    <X className="size-5 text-ras-primary" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-ras-edge pt-ras-section pb-60">
                <p className="text-ras-body-md text-ras-on-surface-variant">
                    Select members and assign them to an admin for follow-up.
                </p>

                {/* Search & filter */}
                <div className="mt-ras-section flex flex-col gap-ras-stack">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ras-on-surface-variant" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search members..."
                            className="h-12 w-full rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-low pl-11 pr-4 text-ras-body-md outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ras-primary"
                        />
                    </div>
                    <div className="flex gap-2">
                        <FilterChip active={filter === "unassigned"} onClick={() => setFilter("unassigned")}>
                            <UserX />
                            Unassigned
                        </FilterChip>
                        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                            <Users />
                            All
                        </FilterChip>
                    </div>
                </div>

                {/* Selection summary */}
                <div className="mt-ras-section flex items-center justify-between">
                    <span className="text-ras-label-caps text-ras-on-surface-variant">
                        Selected members ({selected.size})
                    </span>
                    <button
                        type="button"
                        onClick={() => setSelected(new Set())}
                        disabled={selected.size === 0}
                        className="text-ras-label-caps text-ras-secondary disabled:opacity-40"
                    >
                        Deselect all
                    </button>
                </div>

                {grouped.length === 0 && (
                    <p className="py-16 text-center text-ras-body-md text-ras-on-surface-variant">
                        {filter === "unassigned" && !search ? "Every active member has an admin." : "No members match your search."}
                    </p>
                )}

                {/* Member list, grouped by class */}
                {grouped.map(([group, rows]) => {
                    const allSelected = rows.every((m) => selected.has(m.id));
                    return (
                        <section key={group} className="mt-ras-section space-y-ras-stack">
                            <div className="flex items-center justify-between">
                                <span className="text-ras-label-caps text-ras-secondary">
                                    {group} ({rows.length})
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(rows, !allSelected)}
                                    className="text-ras-label-caps text-ras-on-surface-variant"
                                >
                                    {allSelected ? "Clear class" : "Select class"}
                                </button>
                            </div>
                            {rows.map((m) => {
                                const checked = selected.has(m.id);
                                const prevAdminId = currentAdminId.get(m.id);
                                const prevAdmin = prevAdminId ? adminsById.get(prevAdminId) : null;
                                return (
                                    <label
                                        key={m.id}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-4 rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-lowest p-4 shadow-sm transition-all active:scale-[0.98]",
                                            !checked && selected.size > 0 && "opacity-70"
                                        )}
                                    >
                                        <MemberAvatar name={m.full_name} photoUrl={m.photo_url} />
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <span className="truncate text-ras-title-sm text-ras-on-surface">{m.full_name}</span>
                                            <span className="flex min-w-0 items-center gap-1.5 text-ras-caption text-ras-on-surface-variant">
                                                <AssigneeIndicator admin={prevAdmin} />
                                                <span className="min-w-0 truncate">{memberCaption(m)}</span>
                                            </span>
                                        </div>
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() => toggle(m.id)}
                                            className={checkboxClass}
                                        />
                                    </label>
                                );
                            })}
                        </section>
                    );
                })}
            </main>

            {/* Admin picker + action — pinned so they're reachable from anywhere in a long list */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ras-outline-variant bg-ras-surface px-ras-edge pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-4px_20px_rgba(27,43,72,0.08)]">
                <span className="text-ras-label-caps text-ras-on-surface-variant">Assign to admin</span>
                <AdminPicker selectedId={adminId} onSelect={setAdminId} className="mt-2" />
                <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={effective.length === 0 || !target}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-ras-xl bg-ras-primary-container text-ras-title-sm text-ras-on-primary shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                >
                    <ClipboardCheck className="size-5" />
                    {!target
                        ? "Choose an admin"
                        : effective.length > 0
                          ? `Assign ${effective.length} to ${firstName(target)}`
                          : `Assign to ${firstName(target)}`}
                </button>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent showCloseButton={false} className="gap-ras-section rounded-ras-xl bg-ras-surface p-ras-section">
                    <DialogHeader>
                        <DialogTitle className="text-ras-headline-md text-ras-primary">Confirm assignment</DialogTitle>
                        <DialogDescription className="text-ras-body-md text-ras-on-surface-variant">
                            {target && summarise(effective.length, target, movedFrom, selected.size - effective.length)}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mx-0 mb-0 flex-row gap-3 border-none bg-transparent p-0">
                        <button
                            type="button"
                            onClick={() => setConfirmOpen(false)}
                            className="h-12 flex-1 rounded-ras-xl border border-ras-outline-variant text-ras-body-md text-ras-on-surface transition-colors hover:bg-ras-surface-container-low"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="h-12 flex-1 rounded-ras-xl bg-ras-primary text-ras-title-sm text-ras-on-primary transition-transform active:scale-95"
                        >
                            Assign
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
