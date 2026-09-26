import type { Admin } from "@/lib/sheets";
import { AdminAvatar } from "@/components/AdminAvatar";

// A member's responsible admin, sized to sit inline in a caption line —
// a small avatar, or "Unassigned" in caption type when there's none.
export function AssigneeIndicator({ admin }: { admin: Admin | null | undefined }) {
    if (!admin) {
        return <span className="shrink-0 text-ras-caption font-semibold text-ras-secondary">Unassigned</span>;
    }

    return <AdminAvatar admin={admin} className="size-5" />;
}
