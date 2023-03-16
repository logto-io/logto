import { Theme } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import { PageContext } from './use-page-context';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

export default function useTheme(): Theme {
  const { isPreview, experienceSettings, theme, setTheme } = useContext(PageContext);

  useEffect(() => {
    /**
     * Note:
     * In preview mode, the theme of the page is controlled by the preview options and does not follow system changes.
     * The `usePreview` hook changes the theme of the page by calling the `setTheme` API of the `PageContext`.
     */
    if (isPreview) {
      return;
    }

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
  }, [experienceSettings, isPreview, setTheme]);

  return theme;
}
