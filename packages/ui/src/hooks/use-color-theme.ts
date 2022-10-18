import { absoluteDarken, absoluteLighten } from '@logto/core-kit';
import color from 'color';
import { useEffect } from 'react';

const generateLightColorLibrary = (primaryColor: color) => ({
  [`--color-light-brand`]: primaryColor.hex(),
  [`--color-light-brand-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--color-light-brand-pressed`]: absoluteDarken(primaryColor, 10).string(),
  [`--color-light-overlay-brand-focused`]: primaryColor.alpha(0.16).string(),
  [`--color-light-overlay-brand-hover`]: primaryColor.alpha(0.08).string(),
  [`--color-light-overlay-brand-pressed`]: primaryColor.alpha(0.12).string(),
});

const generateDarkColorLibrary = (primaryColor: color) => ({
  [`--color-dark-brand`]: primaryColor.hex(),
  [`--color-dark-brand-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--color-dark-brand-pressed`]: absoluteDarken(primaryColor, 10).string(),
  [`--color-dark-overlay-brand-focused`]: absoluteLighten(primaryColor, 17)
    .rgb()
    .alpha(0.16)
    .string(),
  [`--color-dark-overlay-brand-hover`]: absoluteLighten(primaryColor, 17)
    .rgb()
    .alpha(0.08)
    .string(),
  [`--color-dark-overlay-brand-pressed`]: absoluteLighten(primaryColor, 17)
    .rgb()
    .alpha(0.12)
    .string(),
});

const useColorTheme = (primaryColor?: string, darkPrimaryColor?: string) => {
  useEffect(() => {
    if (!primaryColor) {
      return;
    }

    const lightPrimary = color(primaryColor);
    const darkPrimary = color(darkPrimaryColor);

    const lightColorLibrary = generateLightColorLibrary(lightPrimary);
    const darkColorLibrary = generateDarkColorLibrary(darkPrimary);

    for (const [key, value] of Object.entries(lightColorLibrary)) {
      document.documentElement.style.setProperty(key, value);
    }

    for (const [key, value] of Object.entries(darkColorLibrary)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [darkPrimaryColor, primaryColor]);
};

export default useColorTheme;
