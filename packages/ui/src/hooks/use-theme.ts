import { useEffect, useContext } from 'react';

import type { Theme } from '@/types';

import { PageContext } from './use-page-context';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme => (darkThemeWatchMedia.matches ? 'dark' : 'light');

export default function useTheme(): Theme {
  const { experienceSettings, theme, setTheme } = useContext(PageContext);

  const consoleThemeFromLocalStorage = window.localStorage.getItem('logto:admin_console:theme');
  useEffect(() => {
    /**
     * If Theme set in console dashboard, then based on localStorage we need update use-theme
     * elseif no key found then will consider theme from system configuration
     */
    const changeTheme = () => {
      if (consoleThemeFromLocalStorage === 'light' || consoleThemeFromLocalStorage === 'dark') {
        setTheme(consoleThemeFromLocalStorage);
      } else {
        setTheme(getThemeBySystemConfiguration);
      }
    };

    changeTheme();

    darkThemeWatchMedia.addEventListener('change', changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
    };
  }, [experienceSettings, setTheme, consoleThemeFromLocalStorage]);

  return theme;
}
