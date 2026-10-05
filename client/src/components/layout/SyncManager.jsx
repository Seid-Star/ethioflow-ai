import { useEffect, useRef, useState } from "react";
import { RefreshCw, CheckCircle2, CloudOff } from "lucide-react";
import { useOnlineStatus } from "../../offline/useOnlineStatus";
import { countPendingSales } from "../../offline/db";
import { syncPendingSales } from "../../offline/syncQueue";

export default function SyncManager() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(null);
  const wasOffline = useRef(false);

  async function refreshCount() {
    const count = await countPendingSales();
    setPendingCount(count);
  }

  // Keep the pending count fresh — covers a new offline sale being saved elsewhere in the app
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 4000);
    return () => clearInterval(interval);
  }, []);

  // The moment the connection comes back after being offline, sync automatically
  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      runSync();
      wasOffline.current = false;
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runSync() {
    setSyncing(true);
    const result = await syncPendingSales();
    await refreshCount();
    setSyncing(false);
    if (result.synced > 0) {
      setJustSynced(result);
      setTimeout(() => setJustSynced(null), 6000);
    }
  }

  if (pendingCount === 0 && !syncing && !justSynced) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-lg">
      {syncing ? (
        <p className="flex items-center gap-2 text-xs text-ink-900/70">
          <RefreshCw size={14} className="animate-spin" /> Syncing{" "}
          {pendingCount} offline sale{pendingCount !== 1 ? "s" : ""}...
        </p>
      ) : justSynced ? (
        <p className="flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 size={14} /> {justSynced.synced} sale
          {justSynced.synced !== 1 ? "s" : ""} synced successfully
          {justSynced.conflicts > 0
            ? ` (${justSynced.conflicts} had stock conflicts — review Inventory)`
            : ""}
        </p>
      ) : pendingCount > 0 ? (
        <button
          onClick={runSync}
          className="flex items-center gap-2 text-xs text-amber-700"
        >
          <CloudOff size={14} /> {pendingCount} sale
          {pendingCount !== 1 ? "s" : ""} waiting to sync — tap to retry
        </button>
      ) : null}
    </div>
  );
}
