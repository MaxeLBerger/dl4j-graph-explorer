import { useState, useEffect, useCallback } from 'react';

// Custom event for local storage changes
const STORAGE_EVENT_NAME = 'local-storage-change';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then
  // parse stored json or if none return initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch a custom event so other hooks in the same window update
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: { key } }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      // Check if the event is for our key
      if ((e as StorageEvent).key === key || (e as CustomEvent).detail?.key === key) {
        setStoredValue(readValue());
      }
    };

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    // Listen for changes from the same window (our custom event)
    window.addEventListener(STORAGE_EVENT_NAME, handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STORAGE_EVENT_NAME, handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
