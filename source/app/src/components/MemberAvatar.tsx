import { cn } from "@/lib/utils";
import { initials, avatarPalette } from "@/lib/member";

export function MemberAvatar({
    name,
    photoUrl,
    className,
}: {
    name: string;
    photoUrl?: string;
    className?: string;
}) {
    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={name}
                className={cn("size-12 shrink-0 rounded-full object-cover", className)}
            />
        );
    }

    const palette = avatarPalette(name);
    return (
        <div
            className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full text-ras-headline-md",
                palette.bg,
                palette.text,
                className
            )}
        >
            {initials(name)}
        </div>
    );
}
