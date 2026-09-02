/**
 * Lightweight in-memory API cache with TTL (time-to-live).
 *
 * Pattern: stale-while-revalidate
 *   - First call  → fetch from network, store in cache
 *   - Repeat call → return cached value instantly, refresh in background
 */

const store = new Map(); // key → { data, expiresAt }

const DEFAULT_TTL_MS = 60_000; // 60 seconds

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  return entry.data; // return even if stale (caller refreshes in background)
}

export function setCached(key, data, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function isStale(key) {
  const entry = store.get(key);
  if (!entry) return true;
  return Date.now() > entry.expiresAt;
}

export function invalidate(key) {
  store.delete(key);
}

export function invalidateAll() {
  store.clear();
}

/**
 * Cached fetch helper.
 *
 * Usage:
 *   const data = await cachedFetch('doctors', () => getDoctors(), setDoctors);
 *
 * @param {string}   key       - Cache key
 * @param {Function} fetcher   - Async function that returns an axios response
 * @param {Function} setter    - React setState to update the component
 * @param {number}   ttlMs     - Cache lifetime in ms (default 60s)
 */
export async function cachedFetch(key, fetcher, setter, ttlMs = DEFAULT_TTL_MS) {
  // 1. Return cached data immediately if available (instant render)
  const cached = getCached(key);
  if (cached !== null) {
    setter(cached);
    // If not stale, skip background refresh
    if (!isStale(key)) return;
  }

  // 2. Fetch fresh data (either first load or background refresh)
  try {
    const res = await fetcher();
    const data = res.data;
    setCached(key, data, ttlMs);
    setter(data);
  } catch (err) {
    // If we already showed cached data, silently swallow the refresh error
    if (cached === null) throw err;
  }
}
