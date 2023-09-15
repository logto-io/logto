import { Theme } from '@logto/schemas';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

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

    darkThemeWatchMedia.addEventListener('change', changeTheme);

    return () => {
      darkThemeWatchMedia.removeEventListener('change', changeTheme);
    };
  }, [experienceSettings, isPreview, setTheme]);
}
