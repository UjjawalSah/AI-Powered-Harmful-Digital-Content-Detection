import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if window is defined (client-side) to avoid SSR issues
    if (typeof window !== 'undefined') {
      // Check local storage
      const savedTheme = localStorage.getItem('guardian-theme') as Theme | null;
      
      // If there's a saved theme, use it
      if (savedTheme) {
        return savedTheme;
      }
      
      // Otherwise check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    
    // Default to light
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem('guardian-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
