import { SearchParameters } from '@/types';
import { getLogtoNativeSdk } from '@/utils/native-sdk';

import { stateUtils } from './state';

/**
 * Social Connector State Utility Methods
 */

const storageStateKeyPrefix = 'social_auth_state';
export const { generateState, storeState, stateValidation } = stateUtils(storageStateKeyPrefix);

/**
 * Native Social Redirect Utility Methods
 */
export const storageCallbackLinkKeyPrefix = 'social_callback_data';
export const { storeState: storeCallbackLink, getState: getCallbackLinkFromStorage } = stateUtils(
  storageCallbackLinkKeyPrefix
);

export const buildSocialLandingUri = (path: string, redirectTo: string) => {
  const { origin } = window.location;
  const url = new URL(`${origin}${path}`);
  url.searchParams.set(SearchParameters.RedirectTo, redirectTo);

  const callbackLink = getLogtoNativeSdk()?.callbackLink;

  if (callbackLink) {
    url.searchParams.set(SearchParameters.NativeCallbackLink, callbackLink);
  }

  return url;
};

export const isAppleConnector = (target?: string) => target === 'apple';
