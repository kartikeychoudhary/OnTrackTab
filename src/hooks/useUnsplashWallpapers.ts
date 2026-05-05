import React from 'react';
import { loadExtensionValue, saveExtensionValue } from '../lib/extensionStorage';
import { fetchUnsplashWallpaper, UNSPLASH_CACHE_KEY, unsplashQueryKey, type UnsplashCacheState } from '../services/unsplash';
import type { Settings } from '../types';

export function useUnsplashWallpapers(settings: Settings, enabled: boolean, onError?: (message: string) => void) {
  const [cache, setCache] = React.useState<UnsplashCacheState>({ items: [], activeIndex: 0 });
  const [loaded, setLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const autoAttemptRef = React.useRef('');

  React.useEffect(() => {
    loadExtensionValue<UnsplashCacheState>(UNSPLASH_CACHE_KEY, { items: [], activeIndex: 0 }).then((storedCache) => {
      setCache({
        items: Array.isArray(storedCache.items) ? storedCache.items : [],
        activeIndex: storedCache.activeIndex || 0,
        remaining: storedCache.remaining,
        limit: storedCache.limit,
        queryKey: storedCache.queryKey,
      });
      setLoaded(true);
    });
  }, []);

  const persistCache = React.useCallback((next: UnsplashCacheState) => {
    setCache(next);
    saveExtensionValue(UNSPLASH_CACHE_KEY, next);
  }, []);

  const trimCache = React.useCallback((nextCache: UnsplashCacheState) => {
    const max = Math.max(5, Math.min(25, settings.unsplashCacheSize || 25));
    if (nextCache.items.length <= max) return nextCache;
    const start = Math.max(0, Math.min(nextCache.activeIndex, nextCache.items.length - 1) - max + 1);
    const items = nextCache.items.slice(start, start + max);
    return { ...nextCache, items, activeIndex: Math.min(items.length - 1, Math.max(0, nextCache.activeIndex - start)) };
  }, [settings.unsplashCacheSize]);

  const clearCache = React.useCallback(() => {
    const next = {
      items: [],
      activeIndex: 0,
      remaining: cache.remaining,
      limit: cache.limit,
      queryKey: unsplashQueryKey(settings.unsplashQuery),
    };
    persistCache(next);
    setError('');
  }, [cache.limit, cache.remaining, persistCache, settings.unsplashQuery]);

  const refresh = React.useCallback(async () => {
    const key = settings.unsplashApiKey.trim();
    if (!key || loading) return;
    setLoading(true);
    try {
      const queryKey = unsplashQueryKey(settings.unsplashQuery);
      const baseItems = cache.queryKey === queryKey ? cache.items : [];
      const { wallpaper, remaining, limit } = await fetchUnsplashWallpaper(key, settings.unsplashQuery);
      const existingIdx = baseItems.findIndex((item) => item.id === wallpaper.id);
      const items = existingIdx >= 0 ? baseItems : [...baseItems, wallpaper];
      const next = trimCache({ items, activeIndex: existingIdx >= 0 ? existingIdx : items.length - 1, remaining, limit, queryKey });
      persistCache(next);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unsplash refresh failed. Try again.';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [cache, loading, onError, persistCache, settings.unsplashApiKey, settings.unsplashQuery, trimCache]);

  React.useEffect(() => {
    if (!loaded || !enabled || !settings.unsplashApiKey.trim() || loading) return;
    const attemptKey = settings.unsplashApiKey.trim();
    if (cache.items.length > 0) return;
    if (autoAttemptRef.current === attemptKey) return;
    autoAttemptRef.current = attemptKey;
    refresh();
  }, [cache.items.length, enabled, loaded, loading, refresh, settings.unsplashApiKey]);

  React.useEffect(() => {
    if (!loaded) return;
    const next = trimCache(cache);
    if (next !== cache) persistCache(next);
  }, [cache, loaded, persistCache, trimCache]);

  const activeWallpaper = cache.items[Math.min(cache.activeIndex, Math.max(0, cache.items.length - 1))];

  const nextWallpaper = React.useCallback(() => {
    if (cache.items.length === 0) return;
    persistCache({ ...cache, activeIndex: (cache.activeIndex + 1) % cache.items.length });
  }, [cache, persistCache]);

  const previousWallpaper = React.useCallback(() => {
    if (cache.items.length === 0) return;
    persistCache({ ...cache, activeIndex: (cache.activeIndex - 1 + cache.items.length) % cache.items.length });
  }, [cache, persistCache]);

  return {
    cache,
    activeWallpaper,
    clearCache,
    error,
    loading,
    nextWallpaper,
    previousWallpaper,
    refresh,
  };
}
