import { type Optional } from '@silverhand/essentials';

export const pickLogoForCurrentThemeHelper = <T extends string | Optional<string>>(
  isDarkMode: boolean,
  logo: T,
  logoDark: T
): T => {
  return (isDarkMode ? logoDark : logo) || logoDark || logo;
};
