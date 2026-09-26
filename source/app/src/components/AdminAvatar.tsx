import { useState } from "react";
import type { Admin } from "@/lib/sheets";
import { initials, avatarPalette } from "@/lib/member";
import { cn } from "@/lib/utils";

type AdminAvatarProps = {
    admin: Pick<Admin, "name" | "email" | "photo_url">;
    className?: string;
};

// Shared avatar for admins — shows the Google profile photo, falling back to
// initials when there's no photo or it fails to load.
export function AdminAvatar({ admin, className }: AdminAvatarProps) {
    // Tracks which URL failed (rather than a boolean) so a changed photo_url
    // gets a fresh attempt without needing an effect to reset state.
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const label = admin.name || admin.email || "Admin";
    const showPhoto = !!admin.photo_url && failedSrc !== admin.photo_url;
    const palette = avatarPalette(label);

    return (
        <div
            className={cn(
                "flex size-9 shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
                palette.bg,
                palette.text,
                className
            )}
            title={label}
            aria-label={label}
        >
            {showPhoto ? (
                <img
                    src={admin.photo_url}
                    alt={label}
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedSrc(admin.photo_url)}
                />
            ) : (
                <span className="text-ras-label-caps text-[11px]">{initials(label) || "?"}</span>
            )}
        </div>
    );
}
