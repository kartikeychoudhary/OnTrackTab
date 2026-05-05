export function loadExtensionValue<T>(key: string, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const storage = window.chrome?.storage?.local;
    if (!storage) {
      try {
        const raw = localStorage.getItem(key);
        resolve(raw ? JSON.parse(raw) as T : fallback);
      } catch {
        resolve(fallback);
      }
      return;
    }
    storage.get(key, (items) => {
      if (window.chrome?.runtime?.lastError) {
        resolve(fallback);
        return;
      }
      resolve(Object.prototype.hasOwnProperty.call(items, key) ? items[key] as T : fallback);
    });
  });
}

export function saveExtensionValue<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    const storage = window.chrome?.storage?.local;
    if (!storage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      resolve();
      return;
    }
    storage.set({ [key]: value }, () => resolve());
  });
}
