// useState that persists and migrates localStorage values. Teaches: lazy init + useEffect.
import { useState, useEffect } from 'react';
export default function useLocalStorage(
  key,
  initial,
  migrate = (value) => value,
) {
  const [v, setV] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? migrate(JSON.parse(saved)) : initial;
    } catch (error) {
      console.error(`Could not load saved data for "${key}".`, error);
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {
      console.error(e);
    }
  }, [key, v]);
  return [v, setV];
}
