import { AppearanceMode } from '@logto/schemas';

import useUserPreferences from './use-user-preferences';

export const useTheme = () => {
  const {
    data: { appearanceMode },
  } = useUserPreferences();

  if (appearanceMode !== AppearanceMode.SyncWithSystem) {
    return appearanceMode;
  }

  const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = darkThemeWatchMedia.matches ? AppearanceMode.DarkMode : AppearanceMode.LightMode;

  return theme;
};
