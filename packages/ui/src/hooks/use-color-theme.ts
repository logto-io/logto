import color from 'color';
import { useEffect } from 'react';

// Color hsl lighten/darken takes percentage value only, need to implement absolute value update
const absoluteLighten = (baseColor: color, delta: number) => {
  const hslArray = baseColor.hsl().round().array() as [number, number, number];

  return color([hslArray[0], hslArray[1], hslArray[2] + delta], 'hsl');
};

const absoluteDarken = (baseColor: color, delta: number) => {
  const hslArray = baseColor.hsl().round().array() as [number, number, number];

  return color([hslArray[0], hslArray[1], hslArray[2] - delta], 'hsl');
};

const generateLightColorLibrary = (primaryColor: color) => ({
  [`--light-primary-color`]: primaryColor.hex(),
  [`--light-focused-variant`]: primaryColor.alpha(0.16).string(),
  [`--light-hover-variant`]: primaryColor.alpha(0.08).string(),
  [`--light-pressed-variant`]: primaryColor.alpha(0.12).string(),
  [`--light-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--light-pressed`]: absoluteDarken(primaryColor, 10).string(),
});

const generateDarkColorLibrary = (primaryColor: color) => ({
  [`--dark-primary-color`]: primaryColor.hex(),
  [`--dark-focused-variant`]: absoluteLighten(primaryColor, 17).rgb().alpha(0.16).string(),
  [`--dark-hover-variant`]: absoluteLighten(primaryColor, 17).rgb().alpha(0.08).string(),
  [`--dark-pressed-variant`]: absoluteLighten(primaryColor, 17).rgb().alpha(0.12).string(),
  [`--dark-hover`]: absoluteLighten(primaryColor, 10).string(),
  [`--dark-pressed`]: absoluteDarken(primaryColor, 10).string(),
});

const useColorTheme = (primaryColor?: string, darkPrimaryColor?: string) => {
  useEffect(() => {
    if (!primaryColor) {
      return;
    }

    const lightPrimary = color(primaryColor);
    const darkPrimary = darkPrimaryColor
      ? color(darkPrimaryColor)
      : absoluteLighten(lightPrimary, 10);

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
