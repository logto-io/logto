import { Theme } from '@logto/schemas';
import { conditionalString, noop, trySafe } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';

import { appearanceModeStorageKey } from '@/consts';
import type { AppearanceMode } from '@/types/appearance-mode';
import { appearanceModeGuard, DynamicAppearanceMode } from '@/types/appearance-mode';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

type Context = {
  theme: Theme;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setFixedTheme: React.Dispatch<React.SetStateAction<Theme | undefined>>;
};

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

export const getAppearanceModeFromLocalStorage = (): AppearanceMode =>
  trySafe(() => appearanceModeGuard.parse(localStorage.getItem(appearanceModeStorageKey))) ??
  DynamicAppearanceMode.System;

const defaultAppearanceMode = getAppearanceModeFromLocalStorage();

const defaultTheme =
  defaultAppearanceMode === DynamicAppearanceMode.System
    ? getThemeBySystemConfiguration()
    : defaultAppearanceMode;

export const AppThemeContext = createContext<Context>({
  theme: defaultTheme,
  setAppearanceMode: noop,
  setFixedTheme: noop,
});

export const AppThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [fixedTheme, setFixedTheme] = useState<Theme>();
  const [mode, setMode] = useState<AppearanceMode>(defaultAppearanceMode);

  const setAppearanceMode = (mode: AppearanceMode) => {
    setMode(mode);
    localStorage.setItem(appearanceModeStorageKey, mode);
  };

  useEffect(() => {
    if (fixedTheme) {
      setTheme(fixedTheme);

      return;
    }

    if (mode !== DynamicAppearanceMode.System) {
      setTheme(mode);

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
  }, [mode, fixedTheme]);

  // Set Theme Mode
  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  const context = useMemo<Context>(
    () => ({
      theme,
      setAppearanceMode,
      setFixedTheme,
    }),
    [theme]
  );

  return <AppThemeContext.Provider value={context}>{children}</AppThemeContext.Provider>;
};
