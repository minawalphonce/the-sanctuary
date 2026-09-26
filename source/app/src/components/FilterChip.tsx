import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// The one chip style for filter/toggle rows — matches the Members "Grouped / All" toggle.
export function FilterChip({
    active = false,
    className,
    children,
    ...props
}: ComponentProps<"button"> & { active?: boolean }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-ras-full px-3 py-1.5 text-ras-label-caps transition-colors [&>svg]:size-4",
                active
                    ? "bg-ras-primary text-ras-on-primary"
                    : "bg-ras-surface-container-highest text-ras-on-surface-variant hover:bg-ras-surface-container-high",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
