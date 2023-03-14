import { ThemeAdaptionStrategy } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import { themeAdaptionStrategyStorageKey } from '@/consts';
import { Theme } from '@/types/theme';

export const getTheme = (themeAdaptionStrategy: ThemeAdaptionStrategy): Theme => {
  if (themeAdaptionStrategy !== ThemeAdaptionStrategy.FollowSystem) {
    return themeAdaptionStrategy === ThemeAdaptionStrategy.LightOnly
      ? Theme.LightMode
      : Theme.DarkMode;
  }

  const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = darkThemeWatchMedia.matches ? Theme.DarkMode : Theme.LightMode;

  return theme;
};

export const getThemeFromLocalStorage = () =>
  getTheme(
    trySafe(() =>
      z
        .nativeEnum(ThemeAdaptionStrategy)
        .parse(localStorage.getItem(themeAdaptionStrategyStorageKey))
    ) ?? ThemeAdaptionStrategy.FollowSystem
  );
