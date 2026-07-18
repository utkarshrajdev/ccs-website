import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

/** Dark mode toggle persisted to localStorage, applied via <html class="dark">. */
export default function useDarkMode() {
  const [dark, setDark] = useLocalStorage('ccs-dark-mode', false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return [dark, () => setDark((d) => !d)];
}
