import { type Theme } from '@logto/schemas';
import { isObject } from '@silverhand/essentials';

/**
 * The theme override carried by the current authentication request.
 *
 * Core resolves the `theme` parameter into the `_logto` flow cookie and renders it into the SSR
 * payload, so a reload, a social callback and the consent redirect all stay on the requested
 * theme, while a later authentication request in the same tab gets whatever that request asked
 * for (or nothing). Core also applies the dev-feature guard before writing the value, so an
 * absent override here covers the disabled case too.
 */
export const getThemeOverride = (): Theme | undefined =>
  isObject(logtoSsr) ? logtoSsr.signInExperience.theme : undefined;
