type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type GlobalRateLimitStore = typeof globalThis & {
  __jobArmRateLimitStore?: Map<string, RateLimitBucket>;
};

function getStore() {
  const globalStore = globalThis as GlobalRateLimitStore;
  if (!globalStore.__jobArmRateLimitStore) {
    globalStore.__jobArmRateLimitStore = new Map<string, RateLimitBucket>();
  }

  return globalStore.__jobArmRateLimitStore;
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const store = getStore();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  store.set(key, bucket);
  return { ok: true };
}
