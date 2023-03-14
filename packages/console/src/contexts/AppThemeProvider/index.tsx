import { ThemeAdaptionStrategy } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';

import useUserPreferences from '@/hooks/use-user-preferences';
import { Theme } from '@/types/theme';

import * as styles from './index.module.scss';

type Props = {
  fixedTheme?: Theme;
  children: ReactNode;
};

type AppTheme = {
  theme: Theme;
};

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.DarkMode : Theme.LightMode;

export const AppThemeContext = createContext<AppTheme>({
  theme: Theme.LightMode,
});

export const AppThemeProvider = ({ fixedTheme, children }: Props) => {
  const [theme, setTheme] = useState<Theme>(Theme.LightMode);

  const {
    data: { themeAdaptionStrategy },
  } = useUserPreferences();

  useEffect(() => {
    if (fixedTheme) {
      setTheme(fixedTheme);

      return;
    }

    if (themeAdaptionStrategy !== ThemeAdaptionStrategy.FollowSystem) {
      setTheme(
        themeAdaptionStrategy === ThemeAdaptionStrategy.LightOnly ? Theme.LightMode : Theme.DarkMode
      );

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
  }, [themeAdaptionStrategy, fixedTheme]);

  // Set Theme Mode
  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  const context = useMemo(
    () => ({
      theme,
    }),
    [theme]
  );

  return <AppThemeContext.Provider value={context}>{children}</AppThemeContext.Provider>;
};
