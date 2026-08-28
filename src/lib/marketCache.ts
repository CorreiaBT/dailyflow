interface CachedItem<T> {
  data: T;
  timestamp: number;
}

export const CDI_CACHE_KEY = "market_cache_cdi_rate";
export const CDI_MAX_AGE_MS = 24 * 3600 * 1000;
export const QUOTE_MAX_AGE_MS = 3600 * 1000;

export function quoteCacheKey(ticker: string): string {
  return `market_cache_b3_${ticker.toLowerCase()}`;
}

export function getCached<T>(key: string): CachedItem<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CachedItem<T>) : null;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() } satisfies CachedItem<T>));
  } catch {
    // localStorage indisponível (modo privado, cota excedida) — ignora silenciosamente
  }
}

export function isExpired(timestamp: number, maxAgeMs: number): boolean {
  return Date.now() - timestamp > maxAgeMs;
}
