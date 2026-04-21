import "server-only";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS = 10;

type Bucket = { hits: number[] };

const store = new Map<string, Bucket>();

function sweep(now: number) {
  if (store.size < 512) return;
  for (const [key, bucket] of store) {
    const fresh = bucket.hits.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) store.delete(key);
    else bucket.hits = fresh;
  }
}

export async function checkReservationRateLimit(identifier: string) {
  const now = Date.now();
  sweep(now);

  const bucket = store.get(identifier) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);

  if (bucket.hits.length >= MAX_HITS) {
    store.set(identifier, bucket);
    return { success: false, remaining: 0 };
  }

  bucket.hits.push(now);
  store.set(identifier, bucket);
  return { success: true, remaining: MAX_HITS - bucket.hits.length };
}
