import { useState } from "react";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { AdminPicker } from "@/components/AdminPicker";

interface AssignAdminSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
    currentAdminId: string | null;
}

// Pick the responsible admin for one member — same horizontal picker as the
// Assign Follow-up screen. The current admin is marked and can't be re-picked.
export function AssignAdminSheet({ open, onOpenChange, member, currentAdminId }: AssignAdminSheetProps) {
    const admins = useDataStore((s) => s.admins);
    const assign = useDataStore((s) => s.assign);
    const [picked, setPicked] = useState<string | null>(null);

    const target = admins.find((a) => a.id === picked);

    const close = (next: boolean) => {
        onOpenChange(next);
        if (!next) setPicked(null);
    };

    // assign() is optimistic — the profile updates as soon as the sheet closes.
    const onConfirm = async () => {
        if (!target) return;
        const name = target.name || target.email;
        close(false);
        try {
            await assign([member.id], target.id);
            toast.success(`${member.full_name} assigned to ${name}`);
        } catch (err) {
            toast.error("Could not assign member", {
                description: err instanceof Error ? err.message : undefined,
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={close}>
            <SheetContent
                side="bottom"
                showCloseButton
                className="max-h-[92vh] gap-0 rounded-t-3xl border-t border-ras-outline-variant bg-ras-surface-container-lowest p-0"
            >
                <SheetHeader className="border-b border-ras-outline-variant px-6 py-5">
                    <p className="text-ras-label-caps uppercase text-ras-secondary">Responsible admin</p>
                    <SheetTitle className="text-ras-headline-md text-ras-primary">
                        {currentAdminId ? "Reassign" : "Assign"} {member.full_name}
                    </SheetTitle>
                </SheetHeader>

                <div className="px-6 pt-5 pb-2">
                    <span className="text-ras-label-caps text-ras-on-surface-variant">Assign to admin</span>
                    <AdminPicker
                        selectedId={picked}
                        onSelect={setPicked}
                        currentId={currentAdminId}
                        className="-mx-6 mt-2 px-6"
                    />
                </div>

                <SheetFooter className="border-t border-ras-outline-variant bg-ras-surface-container-lowest p-6">
                    <button
                        type="button"
                        disabled={!target}
                        onClick={onConfirm}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-ras-xl bg-ras-primary text-ras-title-sm text-ras-on-primary shadow-lg transition-all hover:bg-ras-primary-container active:scale-[0.98] disabled:opacity-60"
                    >
                        <UserCheck className="size-5" />
                        {target ? `Assign to ${target.name || target.email}` : "Choose an admin"}
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
