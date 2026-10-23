import { useCallback, useEffect, useState } from "react";
import { api } from "../api/axios";

export const notifyAdminMessagesChanged = () =>
  window.dispatchEvent(new Event("admin-messages-changed"));

export function useAdminUnread(enabled) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/unread");
      setCount(data.count);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh();
    const timer = setInterval(refresh, 60000);
    window.addEventListener("admin-messages-changed", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("admin-messages-changed", refresh);
    };
  }, [enabled, refresh]);

  return count;
}
