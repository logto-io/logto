import { AppearanceMode } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import { themeStorageKey } from '@/consts';

export const getTheme = (appearanceMode: AppearanceMode) => {
  if (appearanceMode !== AppearanceMode.SyncWithSystem) {
    return appearanceMode;
  }

  const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = darkThemeWatchMedia.matches ? AppearanceMode.DarkMode : AppearanceMode.LightMode;

  return theme;
};

export const getThemeFromLocalStorage = () =>
  getTheme(
    trySafe(() => z.nativeEnum(AppearanceMode).parse(localStorage.getItem(themeStorageKey))) ??
      AppearanceMode.SyncWithSystem
  );
