import { useState } from "react";
import { Map, NotebookPen, Save, Sun, TreePalm } from "lucide-react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useDataStore } from "@/store/data";
import type { SessionRecord } from "@/lib/sheets";
import { findSessionDateCollision } from "@/lib/sessions";
import { cn } from "@/lib/utils";

const SESSION_TYPES = [
    { label: "Outing", icon: Map },
    { label: "Retreat", icon: TreePalm },
    { label: "Day Use", icon: Sun },
    { label: "Other", icon: NotebookPen },
];

const OTHER_LABEL = "Other";

const inputClass =
    "w-full rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-low p-3 text-ras-body-md text-ras-on-surface outline-none transition-colors focus:border-ras-secondary focus:ring-1 focus:ring-ras-secondary";

const labelClass = "px-1 text-ras-label-caps text-ras-on-surface-variant";

function isoToDdMmYyyy(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

interface AddSpecialSessionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddSpecialSessionSheet({ open, onOpenChange }: AddSpecialSessionSheetProps) {
    const appendSession = useDataStore((s) => s.appendSession);
    const sessions = useDataStore((s) => s.sessions);

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [customName, setCustomName] = useState("");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);

    const isOther = selectedType === OTHER_LABEL;
    const name = isOther ? customName.trim() : selectedType ?? "";

    const reset = () => {
        setSelectedType(null);
        setCustomName("");
        setDate("");
        setNotes("");
        setNameError(null);
    };

    const close = (next: boolean) => {
        onOpenChange(next);
        if (!next) reset();
    };

    const onSave = async () => {
        if (!selectedType) {
            setNameError("Choose a session type.");
            return;
        }
        if (isOther && !name) {
            setNameError("Enter a name for this session.");
            return;
        }
        setNameError(null);

        const ddMmYyyy = isoToDdMmYyyy(date);
        if (findSessionDateCollision(sessions, ddMmYyyy)) {
            toast.error("Another session is already scheduled on that date", {
                description: "Pick a different date for this session.",
            });
            return;
        }

        setSaving(true);
        try {
            const session: SessionRecord = {
                id: crypto.randomUUID(),
                date: ddMmYyyy,
                type: "special",
                name,
                notes,
                status: "active",
            };
            await appendSession(session);
            toast.success("Session added", {
                description: `${session.name} has been added.`,
            });
            close(false);
        } catch {
            toast.error("Could not save session", {
                description: "Check your connection and try again.",
            });
        } finally {
            setSaving(false);
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
                    <p className="text-ras-label-caps uppercase text-ras-secondary">Management</p>
                    <SheetTitle className="text-ras-headline-md text-ras-primary">Add Special Session</SheetTitle>
                </SheetHeader>

                <div className="flex-1 space-y-8 overflow-y-auto p-6">
                    {/* Session Type */}
                    <section className="space-y-3">
                        <label className={labelClass}>Session Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {SESSION_TYPES.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                        setSelectedType(label);
                                        setNameError(null);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-ras-lg border p-3 transition-colors",
                                        selectedType === label
                                            ? "border-2 border-ras-secondary bg-ras-secondary-fixed/40 text-ras-secondary"
                                            : "border-ras-outline-variant hover:bg-ras-surface-container-low"
                                    )}
                                >
                                    <Icon className="size-5 text-ras-secondary" />
                                    <span className="text-ras-title-sm">{label}</span>
                                </button>
                            ))}
                        </div>
                        {isOther && (
                            <input
                                value={customName}
                                onChange={(e) => {
                                    setCustomName(e.target.value);
                                    setNameError(null);
                                }}
                                placeholder="Name this session"
                                autoFocus
                                className={inputClass}
                                type="text"
                            />
                        )}
                        {nameError && <p className="px-1 text-ras-label-caps text-ras-error">{nameError}</p>}
                    </section>

                    {/* Date */}
                    <section className="space-y-3">
                        <label className={labelClass}>Date</label>
                        <input
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                            type="date"
                        />
                    </section>

                    {/* Notes */}
                    <section className="space-y-3 pb-4">
                        <label className={labelClass}>Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Location, time, or any other details"
                            rows={3}
                            className={inputClass}
                        />
                    </section>
                </div>

                <SheetFooter className="border-t border-ras-outline-variant bg-ras-surface-container-lowest p-6">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onSave}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-ras-xl bg-ras-primary text-ras-title-sm text-ras-on-primary shadow-lg transition-all hover:bg-ras-primary-container active:scale-[0.98] disabled:opacity-60"
                    >
                        <Save className="size-5" />
                        {saving ? "Saving..." : "Create Session"}
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
