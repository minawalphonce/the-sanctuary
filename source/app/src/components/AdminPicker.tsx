import { useMemo } from "react";
import { useDataStore } from "@/store/data";
import type { Admin } from "@/lib/sheets";
import { currentAssignmentsByMember } from "@/lib/assignments";
import { AdminAvatar } from "@/components/AdminAvatar";
import { cn } from "@/lib/utils";

function adminLabel(admin: Pick<Admin, "name" | "email">) {
    return admin.name || admin.email;
}

interface AdminPickerProps {
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    // Marked "Current" and not selectable — e.g. the member's existing admin.
    currentId?: string | null;
    className?: string;
}

// Horizontal, single-select row of admins (avatar, first name, members assigned).
export function AdminPicker({ selectedId, onSelect, currentId = null, className }: AdminPickerProps) {
    const admins = useDataStore((s) => s.admins);
    const members = useDataStore((s) => s.members);
    const assignments = useDataStore((s) => s.assignments);

    const sorted = useMemo(
        () => [...admins].sort((a, b) => adminLabel(a).localeCompare(adminLabel(b))),
        [admins]
    );

    // admin_id → number of active members currently assigned.
    const countByAdmin = useMemo(() => {
        const current = currentAssignmentsByMember(assignments);
        const counts = new Map<string, number>();
        for (const m of members) {
            const id = m.active ? current.get(m.id)?.admin_id : undefined;
            if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
        }
        return counts;
    }, [members, assignments]);

    return (
        <div className={cn("no-scrollbar -mx-ras-edge flex gap-2 overflow-x-auto px-ras-edge pb-3", className)}>
            {sorted.length === 0 && (
                <span className="text-ras-caption text-ras-on-surface-variant">
                    No admins yet — admins appear after they sign in once.
                </span>
            )}
            {sorted.map((a) => {
                const active = a.id === selectedId;
                const isCurrent = a.id === currentId;
                return (
                    <button
                        key={a.id}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => onSelect(active ? null : a.id)}
                        className={cn(
                            "flex w-[72px] shrink-0 flex-col items-center gap-1 transition-opacity",
                            selectedId && !active && "opacity-50"
                        )}
                    >
                        <span
                            className={cn(
                                "rounded-full p-0.5",
                                active
                                    ? "border-2 border-ras-primary"
                                    : isCurrent
                                      ? "border-2 border-ras-secondary"
                                      : "border border-ras-outline-variant"
                            )}
                        >
                            <AdminAvatar admin={a} className="size-11" />
                        </span>
                        <span
                            className={cn(
                                "w-full truncate text-center text-ras-caption",
                                active ? "font-bold text-ras-primary" : "text-ras-on-surface-variant"
                            )}
                        >
                            {adminLabel(a).split(" ")[0]}
                        </span>
                        <span
                            className={cn(
                                "text-ras-caption text-[10px]",
                                isCurrent ? "font-bold text-ras-secondary" : "text-ras-on-surface-variant"
                            )}
                        >
                            {isCurrent ? "Current" : `${countByAdmin.get(a.id) ?? 0} assigned`}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
