import { Theme } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';

import useUserPreferences from '@/hooks/use-user-preferences';
import { DynamicAppearanceMode } from '@/types/appearance-mode';

import * as styles from './index.module.scss';

type Props = {
  fixedTheme?: Theme;
  children: ReactNode;
};

type AppTheme = {
  theme: Theme;
};

const defaultTheme: Theme = Theme.Light;

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
const getThemeBySystemConfiguration = (): Theme =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

export const AppThemeContext = createContext<AppTheme>({
  theme: defaultTheme,
});

export const AppThemeProvider = ({ fixedTheme, children }: Props) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const {
    data: { appearanceMode },
  } = useUserPreferences();

  useEffect(() => {
    if (fixedTheme) {
      setTheme(fixedTheme);

      return;
    }

    if (appearanceMode !== DynamicAppearanceMode.System) {
      setTheme(appearanceMode);

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
