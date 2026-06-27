import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

// iOS standalone PWAs only check for SW updates on a fresh page load, and
// often sit suspended (not terminated) in the background, so silent
// auto-update can leave users stuck on a stale build indefinitely. This
// prompts them to reload instead of swapping the SW out from under them.
export function usePwaUpdate() {
    const { needRefresh, updateServiceWorker } = useRegisterSW({
        onRegisteredSW(_url, registration) {
            // Re-check for an update whenever the PWA is foregrounded —
            // covers the iOS case where the page was suspended, not reloaded.
            if (!registration) return;
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") {
                    registration.update();
                }
            });
        },
    });

    useEffect(() => {
        if (!needRefresh[0]) return;

        toast("A new version is available", {
            description: "Reload to get the latest updates.",
            duration: Infinity,
            action: {
                label: "Reload",
                onClick: () => updateServiceWorker(true),
            },
        });
    }, [needRefresh, updateServiceWorker]);
}
