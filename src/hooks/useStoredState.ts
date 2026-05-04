import React from 'react';

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
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? hydrateStoredState(defaults, JSON.parse(raw)) : defaults;
    } catch {
      return defaults;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue] as const;
}
