import { type LocalePhrase } from '@logto/phrases-experience';

import { type SignInExperience } from '../db-entries/index.js';

import { type FullSignInExperience } from './sign-in-experience.js';

/**
 * The server-side rendering data type for **experience**.
 */
export type SsrData = {
  signInExperience: {
    appId?: string;
    organizationId?: string;
    uiLocales?: string;
    data: FullSignInExperience;
  };
  phrases: {
    lng: string;
    data: LocalePhrase;
  };
  /**
   * Whether the server runs with dev features enabled. The pre-render script cannot read the
   * build-time flag the app modules use, so guarded behavior it needs to know about travels here.
   */
  isDevFeaturesEnabled?: boolean;
};

/**
 * The server-side rendering data type for **account center**. Only sign-in experience color/theme
 * data is needed for theme flash prevention.
 */
export type AccountCenterSsrSignInExperience = Pick<SignInExperience, 'color'>;

export type AccountCenterSsrData = {
  signInExperience: {
    data: AccountCenterSsrSignInExperience;
  };
};

/**
 * Variable placeholder for **experience** server-side rendering. The value should be replaced by
 * the server.
 *
 * CAUTION: The value should be kept in sync with {@link file://./../../../experience/src/index.html}.
 *
 * @see {@link SsrData} for the data structure to replace the placeholders.
 */
export const ssrPlaceholder = '"__LOGTO_SSR__"';
