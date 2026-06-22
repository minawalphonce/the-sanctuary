import { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/store/data";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Mount once inside AppShell (authenticated zone).
// Kicks off an immediate sync, then re-syncs every SYNC_INTERVAL_MS.
// Renders a debug panel with sync status, but only in dev builds.
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

  if (!import.meta.env.DEV) return null;
  return <DataSyncDebugPanel />;
}

function DataSyncDebugPanel() {
  const syncing = useDataStore((s) => s.syncing);
  const lastSyncedAt = useDataStore((s) => s.lastSyncedAt);
  const error = useDataStore((s) => s.error);
  const admins = useDataStore((s) => s.admins);
  const members = useDataStore((s) => s.members);
  const attendance = useDataStore((s) => s.attendance);
  const followup = useDataStore((s) => s.followup);

  const [now, setNow] = useState(() => new Date());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextSyncAt = lastSyncedAt ? new Date(lastSyncedAt.getTime() + SYNC_INTERVAL_MS) : null;
  const nextSyncInSec = nextSyncAt ? Math.max(0, Math.round((nextSyncAt.getTime() - now.getTime()) / 1000)) : null;

  const statusDotClass = syncing
    ? "h-2 w-2 rounded-full bg-ras-secondary-container animate-pulse"
    : error
      ? "h-2 w-2 rounded-full bg-ras-error"
      : "h-2 w-2 rounded-full bg-ras-tertiary";

  return (
    <div className="ms-3 mb-3 w-64 fixed bottom-ras-bottom-nav z-50 rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-lowest px-ras-edge py-ras-stack text-ras-caption shadow-[0px_4px_20px_rgba(27,43,72,0.08)]">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`flex w-full items-center justify-between ${collapsed ? "" : "mb-1"}`}
      >
        <span className="text-ras-label-caps text-ras-on-surface-variant">Data Sync (dev)</span>
        <span className="flex items-center gap-2">
          <span className={statusDotClass} />
          <span className="text-ras-on-surface-variant">{collapsed ? "▸" : "▾"}</span>
        </span>
      </button>
      {!collapsed && (
        <dl className="space-y-0.5 text-ras-on-surface-variant">
          <div className="flex justify-between gap-2">
            <dt>Status</dt>
            <dd>{syncing ? "Syncing…" : error ? "Error" : "Idle"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Last synced</dt>
            <dd>{lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "Never"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Next sync</dt>
            <dd>{nextSyncInSec !== null ? `${nextSyncInSec}s` : "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Synced</dt>
            <dd>
              {admins.length} admins · {members.length} members · {attendance.length} attendance · {followup.length} followup
            </dd>
          </div>
          {error && (
            <div className="flex justify-between gap-2 text-ras-error">
              <dt>Error</dt>
              <dd className="text-right">{error}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
