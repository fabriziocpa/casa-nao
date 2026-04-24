import "server-only";

const RESERVATION_WINDOW_MS = 60 * 60 * 1000;
const RESERVATION_MAX_HITS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_HITS = 8;

type Bucket = { hits: number[] };

const store = new Map<string, Bucket>();

type RateLimitPolicy = {
  namespace: "reservation" | "login";
  windowMs: number;
  maxHits: number;
};

function sweep(now: number, policy: RateLimitPolicy) {
  if (store.size < 512) return;
  for (const [key, bucket] of store) {
    if (!key.startsWith(`${policy.namespace}:`)) continue;
    const fresh = bucket.hits.filter((t) => now - t < policy.windowMs);
    if (fresh.length === 0) store.delete(key);
    else bucket.hits = fresh;
  }
}

function checkRateLimit(identifier: string, policy: RateLimitPolicy) {
  const now = Date.now();
  sweep(now, policy);

  const key = `${policy.namespace}:${identifier}`;
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < policy.windowMs);

  if (bucket.hits.length >= policy.maxHits) {
    store.set(key, bucket);
    return { success: false, remaining: 0 };
  }

  bucket.hits.push(now);
  store.set(key, bucket);
  return { success: true, remaining: policy.maxHits - bucket.hits.length };
}

export async function checkReservationRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    namespace: "reservation",
    windowMs: RESERVATION_WINDOW_MS,
    maxHits: RESERVATION_MAX_HITS,
  });
}

export async function checkLoginRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    namespace: "login",
    windowMs: LOGIN_WINDOW_MS,
    maxHits: LOGIN_MAX_HITS,
  });
}
