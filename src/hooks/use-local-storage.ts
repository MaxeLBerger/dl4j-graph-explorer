import { useState, useEffect } from 'react';

const LOCAL_EVENT = 'local-storage-sync';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Avoid unnecessary state churn
      setStoredValue(prev => {
        const prevJson = JSON.stringify(prev);
        const nextJson = JSON.stringify(valueToStore);
        return prevJson === nextJson ? prev : valueToStore;
      });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Notify same-window listeners
        window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { key, value: valueToStore } }));
      }
    } catch (e) {
      console.warn('Failed to set localStorage key', key, e);
    }
  };

  useEffect(() => {
    // Sync if value changed in another tab
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(prev => {
            const prevJson = JSON.stringify(prev);
            const nextJson = JSON.stringify(newVal);
            return prevJson === nextJson ? prev : newVal;
          });
        } catch {}
      }
    };
    // Same-window sync via custom event
    const localHandler = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail?.key === key) {
        const newVal = ce.detail.value as T;
        setStoredValue(prev => {
          const prevJson = JSON.stringify(prev);
          const nextJson = JSON.stringify(newVal);
          return prevJson === nextJson ? prev : newVal;
        });
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener(LOCAL_EVENT, localHandler as EventListener);
    return () => window.removeEventListener('storage', handler);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
