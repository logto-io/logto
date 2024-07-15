import { type CSSResult, unsafeCSS } from 'lit';

import { type KebabCase, kebabCase } from './string.js';

/** All the colors to be used in the Logto components and elements. */
export type Color = {
  colorPrimary: string;
  colorText: string;
  colorTextLink: string;
  colorTextSecondary: string;
  colorBorder: string;
  colorCardTitle: string;
  colorLayer1: string;
  colorLayer2: string;
};

/** All the fonts to be used in the Logto components and elements. */
export type Font = {
  fontLabel1: string;
  fontLabel2: string;
  fontLabel3: string;
  fontSectionHeading1: string;
  fontSectionHeading2: string;
};

/** The complete styling properties to be used in the Logto components and elements. */
export type Theme = Color & Font;

export const defaultFontFamily =
  '-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji';

export const defaultFont: Readonly<Font> = Object.freeze({
  fontLabel1: `500 16px / 24px ${defaultFontFamily}`,
  fontLabel2: `500 14px / 20px ${defaultFontFamily}`,
  fontLabel3: `500 12px / 16px ${defaultFontFamily}`,
  fontSectionHeading1: `700 12px / 16px ${defaultFontFamily}`,
  fontSectionHeading2: `700 10px / 16px ${defaultFontFamily}`,
});

export const defaultTheme: Readonly<Theme> = Object.freeze({
  ...defaultFont,
  colorPrimary: '#5d34f2',
  colorText: '#191c1d',
  colorTextLink: '#5d34f2',
  colorTextSecondary: '#747778',
  colorBorder: '#c4c7c7',
  colorCardTitle: '#928f9a',
  colorLayer1: '#000',
  colorLayer2: '#2d3132',
});

export const darkTheme: Readonly<Theme> = Object.freeze({
  ...defaultFont,
  colorPrimary: '#7958ff',
  colorText: '#f7f8f8',
  colorTextLink: '#cabeff',
  colorTextSecondary: '#a9acac',
  colorBorder: '#5c5f60',
  colorCardTitle: '#928f9a',
  colorLayer1: '#2a2c32',
  colorLayer2: '#34353f',
});

/**
 * Converts the theme object to a list of CSS custom properties entries. Each key is prefixed
 * with `--logto-`.
 *
 * @example
 * toLogtoCssEntries(defaultTheme) // [['--logto-color-primary', '#5d34f2'], ...]
 */
export const toLogtoCssEntries = (theme: Theme) =>
  Object.entries(theme).map(([key, value]) =>
    Object.freeze([`--logto-${kebabCase(key)}`, value] as const)
  );

export type ToLogtoCssProperties<T extends Record<string, unknown>> = {
  [K in keyof T as K extends string ? `--logto-${KebabCase<K>}` : never]: T[K];
};

/**
 * Converts the theme object to a map of CSS custom properties. Each key is prefixed with
 * `--logto-`.
 *
 * @example
 * toLogtoCssProperties(defaultTheme) // { '--logto-color-primary': '#5d34f2', ... }
 */
export const toLogtoCssProperties = (theme: Theme): ToLogtoCssProperties<Theme> => {
  // eslint-disable-next-line no-restricted-syntax -- `Object.fromEntries` will lose the type
  return Object.fromEntries(toLogtoCssEntries(theme)) as ToLogtoCssProperties<Theme>;
};

/**
 * Converts the given value to a logto CSS custom property prefixed with `--logto-`.
 *
 * @example
 * toVar('colorPrimary') // '--logto-color-primary' in `CSSResult`
 */
export const toVar = (value: string) => unsafeCSS(`var(--logto-${kebabCase(value)})`);

/**
 * The CSS custom properties in `CSSResult` format for a theme object. You can use this object
 * to apply a custom property from the theme.
 *
 * @example
 * css`
 * p {
 *   color: ${vars.colorPrimary};
 * }
 * `
 */
// eslint-disable-next-line no-restricted-syntax -- `Object.fromEntries` will lose the type
export const vars = Object.freeze(
  Object.fromEntries(Object.keys(defaultTheme).map((key) => [key, toVar(key)]))
) as Record<keyof Theme, CSSResult>;

export const toLitCss = (theme: Theme, name?: string) =>
  unsafeCSS(
    `:host${typeof name === 'string' ? `([theme=${name}])` : ''} {\n` +
      toLogtoCssEntries(theme)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n') +
      '\n}'
  );
