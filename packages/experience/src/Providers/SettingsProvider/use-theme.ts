import { Theme } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { getThemeOverride } from '@/shared/utils/theme';

const prefersDarkSchemeQuery = '(prefers-color-scheme: dark)';

const getDarkThemeWatchMedia = (): MediaQueryList | undefined => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined;
  }

  return window.matchMedia(prefersDarkSchemeQuery);
};

export const getThemeBySystemConfiguration = (): Theme =>
  getDarkThemeWatchMedia()?.matches ? Theme.Dark : Theme.Light;

/**
 * The theme to render with when dark mode is enabled: the override wins over the end-user's OS
 * settings, so an application with its own light / dark toggle stays in sync.
 */
export const getPreferredTheme = (): Theme => getThemeOverride() ?? getThemeBySystemConfiguration();

export default function useTheme() {
  const { isPreview, experienceSettings, setTheme } = useContext(PageContext);

  useEffect(() => {
    if (!experienceSettings?.color.isDarkModeEnabled) {
      return;
    }

    setTheme(getPreferredTheme());

    const darkThemeWatchMedia = getThemeOverride() ? undefined : getDarkThemeWatchMedia();

    if (!darkThemeWatchMedia) {
      return;
    }

    const changeTheme = () => {
      setTheme(getThemeBySystemConfiguration());
    };

    darkThemeWatchMedia.addEventListener('change', changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
    };
  }, [experienceSettings, isPreview, setTheme]);
}
