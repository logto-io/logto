import { Theme } from '@logto/schemas';
import { conditionalString, trySafe } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';

import { appearanceModeStorageKey } from '@/consts';
import type { AppearanceMode } from '@/types/appearance-mode';
import { appearanceModeGuard, DynamicAppearanceMode } from '@/types/appearance-mode';

import * as styles from './index.module.scss';

type Props = {
  fixedTheme?: Theme;
  appearanceMode?: AppearanceMode;
  children: ReactNode;
};

type AppTheme = {
  theme: Theme;
};

const defaultTheme: Theme = Theme.Light;

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

export const getAppearanceModeFromLocalStorage = (): AppearanceMode =>
  trySafe(() => appearanceModeGuard.parse(localStorage.getItem(appearanceModeStorageKey))) ??
  DynamicAppearanceMode.System;

export const AppThemeContext = createContext<AppTheme>({
  theme: defaultTheme,
});

export const AppThemeProvider = ({ fixedTheme, appearanceMode, children }: Props) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    if (fixedTheme) {
      setTheme(fixedTheme);

      return;
    }

    // Note: if the appearanceMode is not available, attempt to retrieve the last saved value from localStorage.
    const appliedAppearanceMode = appearanceMode ?? getAppearanceModeFromLocalStorage();

    if (appliedAppearanceMode !== DynamicAppearanceMode.System) {
      setTheme(appliedAppearanceMode);

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
  }, [appearanceMode, fixedTheme]);

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
