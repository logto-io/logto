import { AppearanceMode } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import { Theme } from '@/types';

import { PageContext } from './use-page-context';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme => (darkThemeWatchMedia.matches ? 'dark' : 'light');

export default function useTheme(mode: AppearanceMode = AppearanceMode.SyncWithSystem): Theme {
  const { experienceSettings, theme, setTheme } = useContext(PageContext);

  useEffect(() => {
    if (mode !== AppearanceMode.SyncWithSystem) {
      setTheme(mode);

      return;
    }

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
  }, [experienceSettings, mode, setTheme]);

  return theme;
}
