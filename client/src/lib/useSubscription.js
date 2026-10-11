import { useCallback, useEffect, useState } from "react";
import { api } from "../api/axios";

// Lets any page tell every subscription-aware component (sidebar badge, locked pages) to refresh
export function notifySubscriptionChanged() {
  window.dispatchEvent(new Event("subscription-changed"));
}

export function useSubscription() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/subscription");
      setSub(data);
    } catch {
      setSub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("subscription-changed", refresh);
    return () => window.removeEventListener("subscription-changed", refresh);
  }, [refresh]);

  return { sub, loading, refresh };
}
