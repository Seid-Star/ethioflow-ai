import { api } from "../api/axios";
import { getPendingSales, removePendingSale, cacheProducts } from "./db";

// Pushes every pending offline sale to the server, removes the ones that succeeded,
// and leaves any that errored in the queue to retry next time.
export async function syncPendingSales() {
  const pending = await getPendingSales();
  if (pending.length === 0) return { synced: 0, conflicts: 0, stillPending: 0 };

  const { data } = await api.post("/sync/sales", { sales: pending });

  let synced = 0;
  let conflicts = 0;

  for (const result of data.results) {
    if (result.status === "synced" || result.status === "already_synced") {
      await removePendingSale(result.offlineTransactionId);
      synced++;
    } else if (result.status === "synced_with_conflict") {
      await removePendingSale(result.offlineTransactionId);
      synced++;
      conflicts++;
    }
    // status === 'error' sales are left in the queue on purpose, to retry later
  }

  // Stock changed on the server because of this sync — refresh the local cache
  try {
    const { data: products } = await api.get("/products");
    await cacheProducts(products);
  } catch {
    // if this fails, the next successful online load will refresh it anyway
  }

  const stillPending = (await getPendingSales()).length;
  return { synced, conflicts, stillPending };
}
