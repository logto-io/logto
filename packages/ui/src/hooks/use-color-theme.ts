import { absoluteDarken, absoluteLighten } from '@logto/core-kit';
import color from 'color';
import { useEffect } from 'react';

const generateLightColorLibrary = (primaryColor: color) => ({
  [`--light-brand-color`]: primaryColor.hex(),
  [`--light-brand-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--light-brand-pressed`]: absoluteDarken(primaryColor, 10).string(),
  [`--light-overlay-brand-focused`]: primaryColor.alpha(0.16).string(),
  [`--light-overlay-brand-hover`]: primaryColor.alpha(0.08).string(),
  [`--light-overlay-brand-pressed`]: primaryColor.alpha(0.12).string(),
});

const generateDarkColorLibrary = (primaryColor: color) => ({
  [`--dark-brand-color`]: primaryColor.hex(),
  [`--dark-brand-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--dark-brand-pressed`]: absoluteDarken(primaryColor, 10).string(),
  [`--dark-overlay-brand-focused`]: absoluteLighten(primaryColor, 17).rgb().alpha(0.16).string(),
  [`--dark-overlay-brand-hover`]: absoluteLighten(primaryColor, 17).rgb().alpha(0.08).string(),
  [`--dark-overlay-brand-pressed`]: absoluteLighten(primaryColor, 17).rgb().alpha(0.12).string(),
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
