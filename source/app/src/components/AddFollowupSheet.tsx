import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import { useDataStore } from "@/store/data";
import type { FollowupOutcome, FollowupType, Member } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { FOLLOWUP_OUTCOMES, FOLLOWUP_OUTCOME_META, FOLLOWUP_TYPES, FOLLOWUP_TYPE_META } from "@/lib/followups";

const labelClass = "text-ras-label-caps uppercase text-ras-on-surface-variant";

// Local date as yyyy-mm-dd — the value format of <input type="date">.
function todayIso(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function isoToDdMmYyyy(iso: string): string {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

interface AddFollowupSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
}

// Log a contact with a member — appends a row to `followups`. Shared by the
// member History tab and the Follow-up tab.
export function AddFollowupSheet({ open, onOpenChange, member }: AddFollowupSheetProps) {
    const appendFollowup = useDataStore((s) => s.appendFollowup);

    const [type, setType] = useState<FollowupType>("call");
    const [outcome, setOutcome] = useState<FollowupOutcome | null>(null);
    const [date, setDate] = useState(todayIso);
    const [notes, setNotes] = useState("");
    const [outcomeError, setOutcomeError] = useState(false);

    const reset = () => {
        setType("call");
        setOutcome(null);
        setDate(todayIso());
        setNotes("");
        setOutcomeError(false);
    };

    const close = (next: boolean) => {
        onOpenChange(next);
        if (!next) reset();
    };

    const onSave = async () => {
        if (!outcome) {
            setOutcomeError(true);
            return;
        }
        const today = todayIso();
        const record = {
            id: crypto.randomUUID(),
            member_id: member.id,
            // Guard against a typed-in future date that slips past `max`.
            date: isoToDdMmYyyy(date && date <= today ? date : today),
            type,
            outcome,
            notes: notes.trim(),
            admin_id: auth.currentUser?.uid ?? "",
            timestamp: new Date().toISOString(),
        };

        // appendFollowup() is optimistic — the entry shows as soon as the sheet closes.
        close(false);
        try {
            await appendFollowup(record);
            toast.success("Follow-up saved", { description: member.full_name });
        } catch (err) {
            toast.error("Could not save follow-up", {
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
                    <p className="text-ras-label-caps uppercase text-ras-secondary">{member.full_name}</p>
                    <SheetTitle className="text-ras-headline-md text-ras-primary">Add Follow-up</SheetTitle>
                </SheetHeader>

                <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-6">
                    {/* Interaction type */}
                    <section className="space-y-3">
                        <h3 className={labelClass}>Interaction Type</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {FOLLOWUP_TYPES.map((value) => {
                                const { label, icon: Icon } = FOLLOWUP_TYPE_META[value];
                                const active = type === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setType(value)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 rounded-ras-lg border p-3 text-ras-body-md transition-colors",
                                            active
                                                ? "border-ras-secondary bg-ras-secondary-fixed/30 text-ras-on-surface"
                                                : "border-ras-outline-variant text-ras-on-surface-variant hover:bg-ras-surface-container-low"
                                        )}
                                    >
                                        <Icon className={cn("size-5", active ? "text-ras-secondary" : "text-ras-on-surface-variant")} />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Outcome */}
                    <section className="space-y-3">
                        <h3 className={labelClass}>Outcome / Status</h3>
                        <div className="flex flex-wrap gap-3">
                            {FOLLOWUP_OUTCOMES.map((value) => {
                                const { label } = FOLLOWUP_OUTCOME_META[value];
                                const active = outcome === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setOutcome(value);
                                            setOutcomeError(false);
                                        }}
                                        className={cn(
                                            "rounded-ras-full border-2 px-5 py-2 text-ras-body-md transition-colors",
                                            active
                                                ? "border-ras-primary bg-ras-primary text-ras-on-primary"
                                                : "border-ras-outline-variant text-ras-on-surface hover:bg-ras-surface-container-low"
                                        )}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        {outcomeError && <p className="text-ras-caption text-ras-error">Choose an outcome.</p>}
                    </section>

                    {/* Date */}
                    <section className="space-y-3">
                        <h3 className={labelClass}>Date</h3>
                        <input
                            type="date"
                            value={date}
                            max={todayIso()}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-low p-3 text-ras-body-md text-ras-on-surface outline-none transition-colors focus:border-ras-secondary focus:ring-1 focus:ring-ras-secondary"
                        />
                    </section>

                    {/* Notes */}
                    <section className="space-y-3">
                        <h3 className={labelClass}>Follow-up Notes</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Enter conversation details..."
                            className="w-full resize-y rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-low p-3 text-ras-body-md text-ras-on-surface outline-none transition-colors focus:border-ras-secondary focus:ring-1 focus:ring-ras-secondary"
                        />
                    </section>
                </div>

                <SheetFooter className="border-t border-ras-outline-variant bg-ras-surface-container-low p-6">
                    <button
                        type="button"
                        onClick={onSave}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-ras-xl bg-ras-primary text-ras-title-sm text-ras-on-primary shadow-lg transition-all hover:bg-ras-primary-container active:scale-[0.98]"
                    >
                        <Save className="size-5" />
                        Save Follow-up
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
