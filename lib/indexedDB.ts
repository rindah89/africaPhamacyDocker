import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'kpbojongo_pos';
const STORE_NAME = 'products';
const DB_VERSION = 1;

interface CacheMetadata {
  lastUpdated: number;
}

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    },
  });
  return db;
}

export async function cacheProducts(products: any[]) {
  const db = await initDB();
  const tx = db.transaction([STORE_NAME, 'metadata'], 'readwrite');
  
  await tx.objectStore(STORE_NAME).put(products, 'allProducts');
  await tx.objectStore('metadata').put({ lastUpdated: Date.now() }, 'productsMetadata');
  
  await tx.done;
}

export async function getCachedProducts(): Promise<{ products: any[] | null; needsRefresh: boolean }> {
  const db = await initDB();
  const products = await db.get(STORE_NAME, 'allProducts');
  const metadata = await db.get('metadata', 'productsMetadata') as CacheMetadata;

  const needsRefresh = !metadata || Date.now() - metadata.lastUpdated > 15 * 60 * 1000; // 15 minutes

  return {
    products: products || null,
    needsRefresh
  };
}

export async function clearCache() {
  const db = await initDB();
  const tx = db.transaction([STORE_NAME, 'metadata'], 'readwrite');
  
  await tx.objectStore(STORE_NAME).clear();
  await tx.objectStore('metadata').clear();
  
  await tx.done;
} 