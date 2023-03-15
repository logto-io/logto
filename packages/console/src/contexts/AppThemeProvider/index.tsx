import { ThemeAdaptionStrategy } from '@logto/schemas';
import { conditionalString, trySafe } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';
import { z } from 'zod';

import { themeAdaptionStrategyStorageKey } from '@/consts';
import { Theme } from '@/types/theme';

import * as styles from './index.module.scss';

type Props = {
  fixedTheme?: Theme;
  strategy?: ThemeAdaptionStrategy;
  children: ReactNode;
};

type AppTheme = {
  theme: Theme;
};

const defaultTheme = Theme.LightMode;

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.DarkMode : Theme.LightMode;

const getThemeAdaptionStrategyFromLocalStorage = (): ThemeAdaptionStrategy =>
  trySafe(() =>
    z.nativeEnum(ThemeAdaptionStrategy).parse(localStorage.getItem(themeAdaptionStrategyStorageKey))
  ) ?? ThemeAdaptionStrategy.FollowSystem;

export const AppThemeContext = createContext<AppTheme>({
  theme: defaultTheme,
});

export const AppThemeProvider = ({ fixedTheme, strategy, children }: Props) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    if (fixedTheme) {
      setTheme(fixedTheme);

      return;
    }

    // Note: if the preferred strategy is not available, attempt to retrieve the last saved value from localStorage.
    const adaptionStrategy = strategy ?? getThemeAdaptionStrategyFromLocalStorage();

    if (adaptionStrategy !== ThemeAdaptionStrategy.FollowSystem) {
      setTheme(
        adaptionStrategy === ThemeAdaptionStrategy.LightOnly ? Theme.LightMode : Theme.DarkMode
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
  }, [strategy, fixedTheme]);

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
