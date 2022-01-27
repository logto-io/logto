import { useState, useEffect } from 'react';

import { Theme } from '@/components/AppContent';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme => (darkThemeWatchMedia.matches ? 'dark' : 'light');

export default function useTheme() {
  const [theme, setTheme] = useState(getThemeBySystemConfiguration());

  useEffect(() => {
    const changeTheme = () => {
      setTheme(getThemeBySystemConfiguration());
    };

    darkThemeWatchMedia.addEventListener('change', changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
    };
  }, []);

  return theme;
}
