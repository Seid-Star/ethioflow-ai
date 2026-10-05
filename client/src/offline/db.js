import { openDB } from "idb";

const DB_NAME = "ethioflow-offline";
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pendingSales")) {
        db.createObjectStore("pendingSales", {
          keyPath: "offlineTransactionId",
        });
      }
      if (!db.objectStoreNames.contains("cachedProducts")) {
        db.createObjectStore("cachedProducts", { keyPath: "_id" });
      }
    },
  });
}

// --- Product cache (so POS can search/sell even with no connection) ---
export async function cacheProducts(products) {
  const db = await getDB();
  const tx = db.transaction("cachedProducts", "readwrite");
  await tx.store.clear();
  for (const p of products) await tx.store.put(p);
  await tx.done;
}

export async function getCachedProducts() {
  const db = await getDB();
  return db.getAll("cachedProducts");
}

// --- Pending sales queue (sales made while offline, waiting to sync) ---
export async function savePendingSale(sale) {
  const db = await getDB();
  await db.put("pendingSales", sale);
}

export async function getPendingSales() {
  const db = await getDB();
  return db.getAll("pendingSales");
}

export async function removePendingSale(offlineTransactionId) {
  const db = await getDB();
  await db.delete("pendingSales", offlineTransactionId);
}

export async function countPendingSales() {
  const db = await getDB();
  return db.count("pendingSales");
}
