import { Theme } from '@logto/schemas';
import { conditionalString, noop, trySafe } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';

import { storageKeys } from '@/consts';
import type { AppearanceMode } from '@/types/appearance-mode';
import { appearanceModeGuard, DynamicAppearanceMode } from '@/types/appearance-mode';

import * as styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
};

type Context = {
  theme: Theme;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setThemeOverride: React.Dispatch<React.SetStateAction<Theme | undefined>>;
};

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

export const buildDefaultAppearanceMode = (): AppearanceMode =>
  trySafe(() => appearanceModeGuard.parse(localStorage.getItem(storageKeys.appearanceMode))) ??
  DynamicAppearanceMode.System;

const defaultAppearanceMode = buildDefaultAppearanceMode();

const defaultTheme =
  defaultAppearanceMode === DynamicAppearanceMode.System
    ? getThemeBySystemConfiguration()
    : defaultAppearanceMode;

export const AppThemeContext = createContext<Context>({
  theme: defaultTheme,
  setAppearanceMode: noop,
  setThemeOverride: noop,
});

export function AppThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [themeOverride, setThemeOverride] = useState<Theme>();
  const [mode, setMode] = useState<AppearanceMode>(defaultAppearanceMode);

  const setAppearanceMode = (mode: AppearanceMode) => {
    setMode(mode);
    localStorage.setItem(storageKeys.appearanceMode, mode);
  };

  useEffect(() => {
    if (themeOverride) {
      setTheme(themeOverride);

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
  }, [mode, themeOverride]);

  // Set Theme Mode
  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  const context = useMemo<Context>(
    () => ({
      theme,
      setAppearanceMode,
      setThemeOverride,
    }),
    [theme]
  );

  return <AppThemeContext.Provider value={context}>{children}</AppThemeContext.Provider>;
}
