import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

function initials(name: string | null): string {
    if (!name) return "?";
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

export function UserAvatar() {
    const [user, setUser] = useState<User | null>(auth.currentUser);

    useEffect(() => {
        return onAuthStateChanged(auth, setUser);
    }, []);

    const photo = user?.photoURL;
    const label = user?.displayName ?? user?.email ?? null;

    return (
        <div
            className="size-9 rounded-full overflow-hidden bg-ras-secondary-container text-ras-on-secondary-container flex items-center justify-center shrink-0 select-none"
            title={label ?? undefined}
            aria-label={label ?? "User avatar"}
        >
            {photo ? (
                <img
                    src={photo}
                    alt={label ?? "User"}
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                />
            ) : (
                <span className="text-ras-label-caps text-[11px]">
                    {initials(label)}
                </span>
            )}
        </div>
    );
}
