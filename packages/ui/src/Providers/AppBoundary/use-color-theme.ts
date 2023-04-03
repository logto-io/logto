import { absoluteDarken, absoluteLighten } from '@logto/core-kit';
import { Theme } from '@logto/schemas';
import color from 'color';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const generateLightColorLibrary = (primaryColor: color) => ({
  [`--color-brand-default`]: primaryColor.hex(),
  [`--color-brand-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--color-brand-pressed`]: absoluteDarken(primaryColor, 10).string(),
  [`--color-overlay-brand-focused`]: primaryColor.alpha(0.16).string(),
  [`--color-overlay-brand-hover`]: primaryColor.alpha(0.08).string(),
  [`--color-overlay-brand-pressed`]: primaryColor.alpha(0.12).string(),
});

const generateDarkColorLibrary = (primaryColor: color) => ({
  [`--color-brand-default`]: primaryColor.hex(),
  [`--color-brand-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--color-brand-pressed`]: absoluteDarken(primaryColor, 10).string(),
  [`--color-overlay-brand-focused`]: absoluteLighten(primaryColor, 30).rgb().alpha(0.16).string(),
  [`--color-overlay-brand-hover`]: absoluteLighten(primaryColor, 30).rgb().alpha(0.08).string(),
  [`--color-overlay-brand-pressed`]: absoluteLighten(primaryColor, 30).rgb().alpha(0.12).string(),
});

const useColorTheme = () => {
  const { theme, experienceSettings } = useContext(PageContext);
  const primaryColor = experienceSettings?.color.primaryColor;
  const darkPrimaryColor = experienceSettings?.color.darkPrimaryColor;

  useEffect(() => {
    if (!primaryColor) {
      return;
    }

    const lightPrimary = color(primaryColor);

    if (theme === Theme.Light) {
      const lightColorLibrary = generateLightColorLibrary(lightPrimary);

      for (const [key, value] of Object.entries(lightColorLibrary)) {
        document.body.style.setProperty(key, value);
      }

      return;
    }

    const darkPrimary = darkPrimaryColor
      ? color(darkPrimaryColor)
      : absoluteLighten(lightPrimary, 10);

    const darkColorLibrary = generateDarkColorLibrary(darkPrimary);

    for (const [key, value] of Object.entries(darkColorLibrary)) {
      document.body.style.setProperty(key, value);
    }
  }, [darkPrimaryColor, primaryColor, theme]);
};

export default useColorTheme;
