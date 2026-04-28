import { Theme } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { searchKeys } from '@/shared/utils/search-parameters';

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
 * Read a forced theme override (`light` | `dark`) from session storage,
 * populated by the `theme` query parameter. Returns `undefined` if not set
 * or if the value is unrecognized — in that case the system preference is used.
 */
export const getThemeOverride = (): Theme | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const value = sessionStorage.getItem(searchKeys.theme);
  if (value === Theme.Dark || value === Theme.Light) {
    return value;
  }
  return undefined;
};

export default function useTheme() {
  const { isPreview, experienceSettings, setTheme } = useContext(PageContext);

  useEffect(() => {
    // An explicit `theme` query param wins regardless of admin Dark mode setting.
    const override = getThemeOverride();
    if (override) {
      setTheme(override);
      return;
    }

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
