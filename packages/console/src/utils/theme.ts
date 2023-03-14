import { AppearanceMode } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import { themeStorageKey } from '@/consts';
import { Theme } from '@/types/theme';

export const getTheme = (appearanceMode: AppearanceMode): Theme => {
  if (appearanceMode !== AppearanceMode.SyncWithSystem) {
    return appearanceMode === AppearanceMode.LightMode ? Theme.LightMode : Theme.DarkMode;
  }

  const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = darkThemeWatchMedia.matches ? Theme.DarkMode : Theme.LightMode;

  return theme;
};

export const getThemeFromLocalStorage = () =>
  getTheme(
    trySafe(() => z.nativeEnum(AppearanceMode).parse(localStorage.getItem(themeStorageKey))) ??
      AppearanceMode.SyncWithSystem
  );
