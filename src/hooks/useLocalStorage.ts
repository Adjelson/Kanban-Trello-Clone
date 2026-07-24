import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setSavedAt(new Date());
    } catch {
      // A interface continua funcional mesmo quando o armazenamento está indisponível.
    }
  }, [key, value]);

  return { value, setValue, savedAt } as const;
}
