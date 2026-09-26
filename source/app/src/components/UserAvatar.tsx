import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AdminAvatar } from "@/components/AdminAvatar";
import { cn } from "@/lib/utils";

// The signed-in user's avatar — reads straight from Firebase Auth so it
// renders before the admins directory has synced.
export function UserAvatar({ className }: { className?: string }) {
    const [user, setUser] = useState<User | null>(auth.currentUser);

    useEffect(() => {
        return onAuthStateChanged(auth, setUser);
    }, []);

    return (
        <AdminAvatar
            admin={{
                name: user?.displayName ?? "",
                email: user?.email ?? "",
                photo_url: user?.photoURL ?? "",
            }}
            className={cn(
                "border-[1.5px] border-ras-secondary-container bg-ras-primary-container text-ras-secondary-container",
                className
            )}
        />
    );
}
