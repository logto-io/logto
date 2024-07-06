import { hexColorRegEx } from '@logto/core-kit';
import { z } from 'zod';

import { type Theme } from '../../types/theme.js';
import { type ToZodObject } from '../../utils/zod.js';

/** Organization branding data for a specific theme. */
export type OrganizationBrandingTheme = Partial<{
  logoUrl: string;
  /**
   * The primary color of the organization. Should be a hex color.
   *
   * @example
   * '#ff0000'
   * '#f00'
   */
  primaryColor: string;
}>;

/** Zod representation of {@link OrganizationBrandingTheme}. */
export const organizationBrandingThemeGuard = z
  .object({
    logoUrl: z.string().url(),
    primaryColor: z.string().regex(hexColorRegEx),
  })
  .partial() satisfies ToZodObject<OrganizationBrandingTheme>;

/** Organization branding data for all themes. */
export type OrganizationBranding = Partial<
  Record<Theme, OrganizationBrandingTheme> & {
    /** URL to the favicon of the organization. */
    faviconUrl: string;
  }
>;

/** Zod representation of {@link OrganizationBranding}. */
export const organizationBrandingGuard = z
  .object({
    light: organizationBrandingThemeGuard,
    dark: organizationBrandingThemeGuard,
    faviconUrl: z.string().url(),
  })
  .partial() satisfies ToZodObject<OrganizationBranding>;
