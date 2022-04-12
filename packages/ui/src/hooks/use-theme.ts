import { useState, useEffect, useContext } from 'react';

import PageContext from './page-context';

export type Theme = 'dark' | 'light';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme => (darkThemeWatchMedia.matches ? 'dark' : 'light');

export default function useTheme() {
  const { experienceSettings } = useContext(PageContext);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (!experienceSettings?.branding.isDarkModeEnabled) {
      return;
    }

    const changeTheme = () => {
      setTheme(getThemeBySystemConfiguration());
    };

    changeTheme();

    darkThemeWatchMedia.addEventListener('change', changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
    };
  }, [experienceSettings]);

  return theme;
}
