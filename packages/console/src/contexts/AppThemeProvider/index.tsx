import { AppearanceMode } from '@logto/schemas';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, createContext } from 'react';

import useUserPreferences from '@/hooks/use-user-preferences';
import { Theme } from '@/types/theme';
import { getTheme } from '@/utils/theme';

import * as styles from './index.module.scss';

type Props = {
  fixedTheme?: Theme;
  children: ReactNode;
};

type AppTheme = {
  theme: Theme;
};

export const AppThemeContext = createContext<AppTheme>({
  theme: Theme.LightMode,
});

export const AppThemeProvider = ({ fixedTheme, children }: Props) => {
  const [theme, setTheme] = useState<Theme>(Theme.LightMode);

  const {
    data: { appearanceMode },
  } = useUserPreferences();

  useEffect(() => {
    const theme = fixedTheme ?? getTheme(appearanceMode);
    const className = styles[theme] ?? '';
    setTheme(theme);

    const shouldSyncWithSystem = !fixedTheme && appearanceMode === AppearanceMode.SyncWithSystem;

    if (!shouldSyncWithSystem) {
      document.body.classList.add(className);
    }

    return () => {
      if (!shouldSyncWithSystem) {
        document.body.classList.remove(className);
      }
    };
  }, [appearanceMode, fixedTheme]);

  const context = useMemo(
    () => ({
      theme,
    }),
    [theme]
  );

  return <AppThemeContext.Provider value={context}>{children}</AppThemeContext.Provider>;
};
