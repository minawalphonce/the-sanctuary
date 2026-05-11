import { useEffect, useRef } from "react";
import { useDataStore } from "@/store/data";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Invisible component — mount once inside AppShell (authenticated zone).
// Kicks off an immediate sync, then re-syncs every SYNC_INTERVAL_MS.
export default function DataSync() {
  const sync = useDataStore((s) => s.sync);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sync();
    intervalRef.current = setInterval(sync, SYNC_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sync]);

  return null;
}
