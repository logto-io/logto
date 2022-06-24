import { useEffect, useContext } from 'react';

import { Theme } from '@/types';

import { PageContext } from './use-page-context';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme => (darkThemeWatchMedia.matches ? 'dark' : 'light');

export default function useTheme(): Theme {
  const { experienceSettings, theme, setTheme } = useContext(PageContext);

  useEffect(() => {
    if (!experienceSettings?.color.isDarkModeEnabled) {
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
  }, [experienceSettings, setTheme]);

  return theme;
}
