import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (mounted ? (resolvedTheme || theme || 'light') : 'light') as Theme;

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return {
    theme: currentTheme,
    toggleTheme,
    setTheme: (t: Theme) => setTheme(t),
    mounted,
  };
}
