import { Theme } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { appearanceModeStorageKey } from '@/consts';
import { appearanceModeGuard, DynamicAppearanceMode } from '@/types/appearance-mode';
import type { AppearanceMode } from '@/types/appearance-mode';

export const getTheme = (appearanceMode: AppearanceMode): Theme => {
  if (appearanceMode !== DynamicAppearanceMode.System) {
    return appearanceMode;
  }

  const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

  return theme;
};

export const getThemeFromLocalStorage = () => getTheme(getAppearanceModeFromLocalStorage());

export const getAppearanceModeFromLocalStorage = (): AppearanceMode =>
  trySafe(() => appearanceModeGuard.parse(localStorage.getItem(appearanceModeStorageKey))) ??
  DynamicAppearanceMode.System;
