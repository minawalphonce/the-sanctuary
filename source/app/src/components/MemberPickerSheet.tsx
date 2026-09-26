import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { MemberAvatar } from "@/components/MemberAvatar";

interface MemberPickerSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPick: (member: Member) => void;
    title?: string;
}

// Searchable list of active members; picking one calls `onPick` and closes.
export function MemberPickerSheet({ open, onOpenChange, onPick, title = "Choose a member" }: MemberPickerSheetProps) {
    const members = useDataStore((s) => s.members);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return members
            .filter((m) => m.active && (!query || m.full_name.toLowerCase().includes(query)))
            .sort((a, b) => a.full_name.localeCompare(b.full_name));
    }, [members, search]);

    const close = (next: boolean) => {
        onOpenChange(next);
        if (!next) setSearch("");
    };

    return (
        <Sheet open={open} onOpenChange={close}>
            <SheetContent
                side="bottom"
                showCloseButton
                className="data-[side=bottom]:h-[85dvh] gap-0 rounded-t-3xl border-t border-ras-outline-variant bg-ras-surface-container-lowest p-0"
            >
                <SheetHeader className="border-b border-ras-outline-variant px-6 py-5">
                    <p className="text-ras-label-caps uppercase text-ras-secondary">Add Follow-up</p>
                    <SheetTitle className="text-ras-headline-md text-ras-primary">{title}</SheetTitle>
                </SheetHeader>

                <div className="border-b border-ras-outline-variant px-6 py-4">
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
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {filtered.length === 0 && (
                        <p className="px-6 py-12 text-center text-ras-body-md text-ras-on-surface-variant">
                            No members match your search.
                        </p>
                    )}
                    {filtered.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                                close(false);
                                onPick(m);
                            }}
                            className="flex w-full items-center gap-4 border-b border-ras-outline-variant px-6 py-3 text-left transition-colors hover:bg-ras-surface-container-low active:opacity-80"
                        >
                            <MemberAvatar name={m.full_name} photoUrl={m.photo_url} className="size-10 text-ras-title-sm" />
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-ras-title-sm text-ras-on-surface">{m.full_name}</span>
                                {m.group && <span className="text-ras-caption text-ras-on-surface-variant">{m.group}</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
