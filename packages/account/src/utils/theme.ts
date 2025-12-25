import { Theme } from '@logto/schemas';

const darkThemeWatchMedia = window.matchMedia('(prefers-color-scheme: dark)');

export const getThemeBySystemPreference = () =>
  darkThemeWatchMedia.matches ? Theme.Dark : Theme.Light;

export const subscribeToSystemTheme = (listener: () => void) => {
  darkThemeWatchMedia.addEventListener('change', listener);

  return () => {
    darkThemeWatchMedia.removeEventListener('change', listener);
  };
};
