import React from 'react';
import { loadExtensionValue, saveExtensionValue } from '../lib/extensionStorage';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function hydrateStoredState<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) {
    if (Array.isArray(stored)) return stored as T;
    if (isPlainObject(stored)) return Object.values(stored) as T;
    return defaults;
  }
  if (isPlainObject(defaults) && isPlainObject(stored)) {
    const merged: Record<string, unknown> = { ...defaults };
    Object.entries(stored).forEach(([key, value]) => {
      merged[key] = key in defaults ? hydrateStoredState(defaults[key as keyof typeof defaults], value) : value;
    });
    return merged as T;
  }
  return (stored ?? defaults) as T;
}

export function useStoredState<T>(key: string, defaults: T) {
  const [loaded, setLoaded] = React.useState(false);
  const persistedRef = React.useRef('');
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      const initial = raw ? hydrateStoredState(defaults, JSON.parse(raw)) : defaults;
      persistedRef.current = JSON.stringify(initial);
      return initial;
    } catch {
      persistedRef.current = JSON.stringify(defaults);
      return defaults;
    }
  });

  React.useEffect(() => {
    let cancelled = false;
    loadExtensionValue<T>(key, value).then((stored) => {
      if (cancelled) return;
      const hydrated = hydrateStoredState(defaults, stored);
      const serialized = JSON.stringify(hydrated);
      persistedRef.current = serialized;
      setValue(hydrated);
      try {
        localStorage.setItem(key, serialized);
      } catch {}
      saveExtensionValue(key, hydrated);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [defaults, key]);

  React.useEffect(() => {
    const chromeStorage = window.chrome?.storage;
    const onChromeChange = (changes: Record<string, { newValue?: unknown }>, areaName: string) => {
      if (areaName !== 'local' || !(key in changes)) return;
      const hydrated = hydrateStoredState(defaults, changes[key].newValue);
      const serialized = JSON.stringify(hydrated);
      if (persistedRef.current === serialized) return;
      persistedRef.current = serialized;
      setValue(hydrated);
      try {
        localStorage.setItem(key, serialized);
      } catch {}
    };
    chromeStorage?.onChanged?.addListener(onChromeChange);

    const onLocalStorageChange = (event: StorageEvent) => {
      if (event.key !== key || event.newValue == null) return;
      try {
        if (persistedRef.current === event.newValue) return;
        persistedRef.current = event.newValue;
        setValue(hydrateStoredState(defaults, JSON.parse(event.newValue)));
      } catch {}
    };
    window.addEventListener('storage', onLocalStorageChange);

    return () => {
      chromeStorage?.onChanged?.removeListener(onChromeChange);
      window.removeEventListener('storage', onLocalStorageChange);
    };
  }, [defaults, key]);

  React.useEffect(() => {
    if (!loaded) return;
    const serialized = JSON.stringify(value);
    if (persistedRef.current === serialized) return;
    persistedRef.current = serialized;
    try {
      localStorage.setItem(key, serialized);
    } catch {}
    saveExtensionValue(key, value);
  }, [key, loaded, value]);

  return [value, setValue] as const;
}
