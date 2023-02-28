import { AppearanceMode } from '@logto/schemas';

export const getTheme = (appearanceMode: AppearanceMode) => {
  if (appearanceMode !== AppearanceMode.SyncWithSystem) {
    return appearanceMode;
  }

  const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = darkThemeWatchMedia.matches ? AppearanceMode.DarkMode : AppearanceMode.LightMode;

  return theme;
};
