import { AppearanceMode } from '@logto/schemas';
import { useState, useEffect, useContext } from 'react';

import { Theme } from '@/types';

import { PageContext } from './use-page-context';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme => (darkThemeWatchMedia.matches ? 'dark' : 'light');

export default function useTheme(mode: AppearanceMode = AppearanceMode.SyncWithSystem): Theme {
  const { experienceSettings, setTheme: setContextTheme } = useContext(PageContext);

  const [theme, setTheme] = useState<Theme>(
    mode === AppearanceMode.SyncWithSystem ? 'light' : mode
  );

  useEffect(() => {
    setContextTheme(theme);
  }, [setContextTheme, theme]);

  useEffect(() => {
    if (mode !== AppearanceMode.SyncWithSystem || !experienceSettings?.branding.isDarkModeEnabled) {
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
  }, [experienceSettings, mode]);

  return theme;
}
