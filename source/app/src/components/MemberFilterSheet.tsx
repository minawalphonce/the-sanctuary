import { Dumbbell, ArrowUpDown, Check, Ban, ArrowDownAZ } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type StatusFilter = "active" | "inactive";
export type SortOption = "name-az" | "recent";

export interface MemberFilters {
    groups: string[];
    status: StatusFilter;
    sort: SortOption;
}

interface MemberFilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allGroups: string[];
    filters: MemberFilters;
    onApply: (filters: MemberFilters) => void;
}

export function MemberFilterSheet({
    open,
    onOpenChange,
    allGroups,
    filters,
    onApply,
}: MemberFilterSheetProps) {
    const toggleGroup = (group: string) => {
        const groups = filters.groups.includes(group)
            ? filters.groups.filter((g) => g !== group)
            : [...filters.groups, group];
        onApply({ ...filters, groups });
    };

    const setStatus = (status: StatusFilter) => onApply({ ...filters, status });
    const setSort = (sort: SortOption) => onApply({ ...filters, sort });

    const reset = () =>
        onApply({ groups: [], status: "active", sort: "name-az" });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton={false}
                className="w-[85%] max-w-[400px] gap-0 border-l border-ras-outline-variant bg-ras-surface p-0"
            >
                <SheetHeader className="h-16 flex-row items-center justify-between border-b border-ras-outline-variant px-ras-edge py-0">
                    <SheetTitle className="text-ras-headline-md font-extrabold text-ras-primary">
                        Filter Members
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 space-y-8 overflow-y-auto px-ras-edge py-ras-section">
                    {/* Class */}
                    <section className="space-y-ras-stack">
                        <div className="mb-2 flex items-center gap-2">
                            <Dumbbell className="size-5 text-ras-secondary" />
                            <h3 className="text-ras-label-caps text-ras-secondary">
                                Class
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {allGroups.map((group) => {
                                const checked = filters.groups.includes(group);
                                return (
                                    <label
                                        key={group}
                                        className={cn(
                                            "flex items-center justify-between rounded-ras-xl border p-3 transition-colors cursor-pointer",
                                            checked
                                                ? "border-ras-primary bg-ras-primary/5"
                                                : "border-ras-outline-variant hover:bg-ras-surface-container-low"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "text-ras-body-md",
                                                checked
                                                    ? "font-semibold text-ras-primary"
                                                    : "text-ras-on-surface"
                                            )}
                                        >
                                            {group}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleGroup(group)}
                                            className="size-5 rounded border-ras-outline text-ras-primary focus:ring-ras-primary focus:ring-offset-0"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    {/* Status */}
                    <section className="space-y-ras-stack">
                        <div className="mb-2 flex items-center gap-2">
                            <ArrowUpDown className="size-5 text-ras-secondary" />
                            <h3 className="text-ras-label-caps text-ras-secondary">
                                Status
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus("active")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-ras-xl py-3 text-ras-body-md transition-colors",
                                    filters.status === "active"
                                        ? "border-2 border-ras-primary bg-ras-primary text-ras-on-primary shadow-md"
                                        : "border border-ras-outline-variant bg-ras-surface-container-lowest text-ras-on-surface-variant hover:bg-ras-surface-container-low"
                                )}
                            >
                                <Check className="size-[18px]" />
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus("inactive")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-ras-xl py-3 text-ras-body-md transition-colors",
                                    filters.status === "inactive"
                                        ? "border-2 border-ras-primary bg-ras-primary text-ras-on-primary shadow-md"
                                        : "border border-ras-outline-variant bg-ras-surface-container-lowest text-ras-on-surface-variant hover:bg-ras-surface-container-low"
                                )}
                            >
                                <Ban className="size-[18px]" />
                                Inactive
                            </button>
                        </div>
                    </section>

                    {/* Sort By */}
                    <section className="space-y-ras-stack">
                        <div className="mb-2 flex items-center gap-2">
                            <ArrowDownAZ className="size-5 text-ras-secondary" />
                            <h3 className="text-ras-label-caps text-ras-secondary">
                                Sort By
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {([
                                { value: "name-az", label: "Name A-Z" },
                            ] as { value: SortOption; label: string }[]).map(
                                ({ value, label }) => {
                                    const checked = filters.sort === value;
                                    return (
                                        <label
                                            key={value}
                                            className={cn(
                                                "flex items-center gap-3 rounded-ras-xl border p-3 transition-all cursor-pointer",
                                                checked
                                                    ? "border-ras-primary bg-ras-primary/5"
                                                    : "border-ras-outline-variant"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "flex size-4 items-center justify-center rounded-full border-2",
                                                    checked
                                                        ? "border-ras-primary"
                                                        : "border-ras-outline-variant"
                                                )}
                                            >
                                                {checked && (
                                                    <span className="size-2 rounded-full bg-ras-primary" />
                                                )}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-ras-body-md",
                                                    checked
                                                        ? "text-ras-primary"
                                                        : "text-ras-on-surface"
                                                )}
                                            >
                                                {label}
                                            </span>
                                            <input
                                                type="radio"
                                                name="sort"
                                                className="hidden"
                                                checked={checked}
                                                onChange={() => setSort(value)}
                                            />
                                        </label>
                                    );
                                }
                            )}
                        </div>
                    </section>
                </div>

                <SheetFooter className="space-y-3 border-t border-ras-outline-variant bg-ras-surface p-ras-edge">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-ras-xl bg-ras-primary text-ras-title-sm text-ras-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95"
                    >
                        Apply Filters
                    </button>
                    <button type="button" onClick={reset} className="flex h-12 w-full items-center justify-center rounded-ras-xl border border-transparent text-ras-body-md text-ras-error transition-colors hover:bg-ras-error-container/20 active:border-ras-error/20">
                        Reset All Filters
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
