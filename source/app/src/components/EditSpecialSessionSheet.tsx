import { useState } from "react";
import { Map, NotebookPen, Save, Sun, TreePalm } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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

// `key` is the translation key under attendance.editSheet.types.
const SESSION_TYPES = [
    { key: "outing", icon: Map },
    { key: "retreat", icon: TreePalm },
    { key: "dayUse", icon: Sun },
    { key: "other", icon: NotebookPen },
];

const inputClass =
    "w-full rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-low p-3 text-ras-body-md text-ras-on-surface outline-none transition-colors focus:border-ras-secondary focus:ring-1 focus:ring-ras-secondary";

const labelClass = "px-1 text-ras-label-caps text-ras-on-surface-variant";

function isoToDdMmYyyy(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function ddMmYyyyToIso(value: string): string {
    if (!value) return "";
    const [d, m, y] = value.split("/");
    if (!d || !m || !y) return "";
    return `${y}-${m}-${d}`;
}

interface EditSpecialSessionSheetProps {
    session: SessionRecord | null;
    onOpenChange: (open: boolean) => void;
}

export function EditSpecialSessionSheet({ session, onOpenChange }: EditSpecialSessionSheetProps) {
    const { t } = useTranslation(undefined, { keyPrefix: "attendance.editSheet" });
    const updateSession = useDataStore((s) => s.updateSession);
    const sessions = useDataStore((s) => s.sessions);

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);

    // Sync form fields whenever a different session is opened for editing —
    // can't seed useState directly since `session` arrives via prop after
    // the row is clicked, not at mount time.
    const [syncedId, setSyncedId] = useState<string | null>(null);
    if (session && syncedId !== session.id) {
        setSyncedId(session.id);
        setName(session.name);
        setDate(ddMmYyyyToIso(session.date));
        setNotes(session.notes);
        setNameError(null);
    }

    const isKnownType = SESSION_TYPES.some(({ key }) => t(`types.${key}`) === name);

    const close = (next: boolean) => {
        onOpenChange(next);
        if (!next) setSyncedId(null);
    };

    const onSave = async () => {
        if (!session) return;
        if (!name.trim()) {
            setNameError(t("errors.name"));
            return;
        }
        setNameError(null);

        const ddMmYyyy = isoToDdMmYyyy(date);
        if (findSessionDateCollision(sessions, ddMmYyyy, session.id)) {
            toast.error(t("toast.collision.title"), {
                description: t("toast.collision.description"),
            });
            return;
        }

        setSaving(true);
        try {
            const updated: SessionRecord = {
                ...session,
                date: ddMmYyyy,
                name: name.trim(),
                notes,
            };
            await updateSession(session.id, updated);
            toast.success(t("toast.updated"), {
                description: t("toast.updatedDescription", { name: updated.name }),
            });
            close(false);
        } catch {
            toast.error(t("toast.error"), {
                description: t("toast.errorDescription"),
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Sheet open={session !== null} onOpenChange={close}>
            <SheetContent
                side="bottom"
                showCloseButton
                className="max-h-[92vh] gap-0 rounded-t-3xl border-t border-ras-outline-variant bg-ras-surface-container-lowest p-0"
            >
                <SheetHeader className="border-b border-ras-outline-variant px-6 py-5">
                    <p className="text-ras-label-caps uppercase text-ras-secondary">{t("eyebrow")}</p>
                    <SheetTitle className="text-ras-headline-md text-ras-primary">{t("title")}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 space-y-8 overflow-y-auto p-6">
                    {/* Session Type */}
                    <section className="space-y-3">
                        <label className={labelClass}>{t("sessionType")}</label>
                        <div className="grid grid-cols-2 gap-3">
                            {SESSION_TYPES.map(({ key, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setName(t(`types.${key}`));
                                        setNameError(null);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-ras-lg border p-3 transition-colors",
                                        name === t(`types.${key}`)
                                            ? "border-2 border-ras-secondary bg-ras-secondary-fixed/40 text-ras-secondary"
                                            : "border-ras-outline-variant hover:bg-ras-surface-container-low"
                                    )}
                                >
                                    <Icon className="size-5 text-ras-secondary" />
                                    <span className="text-ras-title-sm">{t(`types.${key}`)}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Name */}
                    <section className="space-y-3">
                        <label className={labelClass}>{t("sessionName")}</label>
                        <input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError(null);
                            }}
                            placeholder={t("namePlaceholder")}
                            dir="auto"
                            className={inputClass}
                            type="text"
                        />
                        {!isKnownType && (
                            <p className="px-1 text-ras-caption text-ras-on-surface-variant">
                                {t("customNameNote")}
                            </p>
                        )}
                        {nameError && <p className="px-1 text-ras-label-caps text-ras-error">{nameError}</p>}
                    </section>

                    {/* Date */}
                    <section className="space-y-3">
                        <label className={labelClass}>{t("date")}</label>
                        <input
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                            type="date"
                        />
                    </section>

                    {/* Notes */}
                    <section className="space-y-3 pb-4">
                        <label className={labelClass}>{t("notes")}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t("notesPlaceholder")}
                            dir="auto"
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
                        {saving ? t("saving") : t("save")}
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
