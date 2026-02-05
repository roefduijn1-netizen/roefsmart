import { useEffect } from 'react';
export function useTheme() {
  // Always enforce dark mode
  const isDark = true;
  useEffect(() => {
    const root = window.document.documentElement;
    // Remove light class and add dark class to enforce theme
    root.classList.remove('light');
    root.classList.add('dark');
    // Enforce dark mode in local storage to prevent any legacy logic from switching it back
    try {
        localStorage.setItem('theme', 'dark');
    } catch (e) {
        // Ignore storage errors
    }
  }, []);
  // No-op toggle function to maintain interface compatibility
  const toggleTheme = () => {
    // Theme toggling is disabled
  };
  return { isDark, toggleTheme };
}