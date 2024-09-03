import { type CSSResult, unsafeCSS } from 'lit';

import { type KebabCase, kebabCase } from './string.js';

/** All the colors to be used in the Logto components and elements. */
export type Color = {
  colorPrimary: string;
  colorOnPrimary: string;
  colorPrimaryPressed: string;
  colorPrimaryHover: string;
  colorTextPrimary: string;
  colorTextLink: string;
  colorTextSecondary: string;
  colorBorder: string;
  colorCardTitle: string;
  colorLayer1: string;
  colorLayer2: string;
  colorLineDivider: string;
  colorDisabled: string;
  colorDisabledBackground: string;
  colorHover: string;
  colorHoverVariant: string;
  colorPressed: string;
  colorFocused: string;
  colorFocusedVariant: string;
  colorOverlay: string;
  colorPlaceholder: string;
};

/** All the fonts to be used in the Logto components and elements. */
export type Font = {
  fontTitle1: string;
  fontTitle2: string;
  fontTitle3: string;
  fontLabel1: string;
  fontLabel2: string;
  fontLabel3: string;
  fontBody1: string;
  fontBody2: string;
  fontBody3: string;
  fontSectionHeading1: string;
  fontSectionHeading2: string;
};

/** The complete styling properties to be used in the Logto components and elements. */
export type Theme = Color & Font;

export const defaultFontFamily =
  '-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji';

export const defaultFont: Readonly<Font> = Object.freeze({
  fontTitle1: `600 20px / 28px ${defaultFontFamily}`,
  fontTitle2: `600 16px / 24px ${defaultFontFamily}`,
  fontTitle3: `600 14px / 20px ${defaultFontFamily}`,
  fontLabel1: `500 16px / 24px ${defaultFontFamily}`,
  fontLabel2: `500 14px / 20px ${defaultFontFamily}`,
  fontLabel3: `500 12px / 16px ${defaultFontFamily}`,
  fontBody1: `400 16px / 24px ${defaultFontFamily}`,
  fontBody2: `400 14px / 20px ${defaultFontFamily}`,
  fontBody3: `400 12px / 16px ${defaultFontFamily}`,
  fontSectionHeading1: `700 12px / 16px ${defaultFontFamily}`,
  fontSectionHeading2: `700 10px / 16px ${defaultFontFamily}`,
});

export const defaultTheme: Readonly<Theme> = Object.freeze({
  ...defaultFont,
  colorPrimary: '#5d34f2',
  colorOnPrimary: '#000',
  colorPrimaryPressed: '#e6deff',
  colorPrimaryHover: '#af9eff',
  colorTextPrimary: '#191c1d',
  colorTextLink: '#5d34f2',
  colorTextSecondary: '#747778',
  colorBorder: '#c4c7c7',
  colorCardTitle: '#928f9a',
  colorLayer1: '#000',
  colorLayer2: '#2d3132',
  colorLineDivider: '#191c1d1f',
  colorDisabled: '#5c5f60',
  colorDisabledBackground: '#2d3132',
  colorHover: '#191c1d14',
  colorHoverVariant: '#5d34f214',
  colorPressed: 'rgba(25, 28, 29, 12%)',
  colorFocused: 'rgba(25, 28, 29, 16%)',
  colorFocusedVariant: '#5d34f229',
  colorOverlay: '#000000b3',
  colorPlaceholder: '#747778',
});

export const darkTheme: Readonly<Theme> = Object.freeze({
  ...defaultFont,
  colorPrimary: '#7958ff',
  colorOnPrimary: '#fff',
  colorPrimaryPressed: '#5d34f2',
  colorPrimaryHover: '#947dff',
  colorTextPrimary: '#f7f8f8',
  colorTextLink: '#cabeff',
  colorTextSecondary: '#a9acac',
  colorBorder: '#5c5f60',
  colorCardTitle: '#928f9a',
  colorLayer1: '#2a2c32',
  colorLayer2: '#34353f',
  colorLineDivider: '#f7f8f824',
  colorDisabled: '#5c5f60',
  colorDisabledBackground: '#2d3132',
  colorHover: '#f7f8f814',
  colorHoverVariant: '#cabeff14',
  colorPressed: 'rgba(247, 248, 248, 12%)',
  colorFocused: 'rgba(247, 248, 248, 16%)',
  colorFocusedVariant: '#cabeff29',
  colorOverlay: '#0000003c',
  colorPlaceholder: '#747778',
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
export const vars: Record<keyof Theme, CSSResult> = Object.freeze(
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
