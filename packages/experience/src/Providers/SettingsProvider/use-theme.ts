import { Theme } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const prefersDarkSchemeQuery = '(prefers-color-scheme: dark)';

const getDarkThemeWatchMedia = (): MediaQueryList | undefined => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined;
  }

  return window.matchMedia(prefersDarkSchemeQuery);
};

export const getThemeBySystemConfiguration = (): Theme =>
  getDarkThemeWatchMedia()?.matches ? Theme.Dark : Theme.Light;

export default function useTheme() {
  const { isPreview, experienceSettings, setTheme } = useContext(PageContext);

  useEffect(() => {
    if (!experienceSettings?.color.isDarkModeEnabled) {
      return;
    }

    const changeTheme = () => {
      setTheme(getThemeBySystemConfiguration());
    };

    changeTheme();

    const darkThemeWatchMedia = getDarkThemeWatchMedia();

    if (!darkThemeWatchMedia) {
      return;
    }

    darkThemeWatchMedia.addEventListener('change', changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
    };
  }, [experienceSettings, isPreview, setTheme]);
}
