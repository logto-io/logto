/**
 * Temp Solution for getting the sign in experience
 * Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInIdentifier } from '@logto/schemas';
import i18next from 'i18next';
import type { TFuncKey } from 'react-i18next';

import { getSignInExperience } from '@/apis/settings';
import defaultAppleTouchLogo from '@/assets/apple-touch-icon.png';
import defaultFavicon from '@/assets/favicon.png';
import type { SignInExperienceResponse } from '@/types';
import { filterSocialConnectors } from '@/utils/social-connectors';

const parseSignInExperienceResponse = (
  response: SignInExperienceResponse
): SignInExperienceResponse => {
  const { socialConnectors, ...rest } = response;

  return {
    ...rest,
    socialConnectors: filterSocialConnectors(socialConnectors),
  };
};

export const getSignInExperienceSettings = async (): Promise<SignInExperienceResponse> => {
  const response = await getSignInExperience<SignInExperienceResponse>();

  return parseSignInExperienceResponse(response);
};

export const isEmailOrPhoneMethod = (
  method: SignInIdentifier
): method is SignInIdentifier.Email | SignInIdentifier.Phone =>
  [SignInIdentifier.Email, SignInIdentifier.Phone].includes(method);

export const parseHtmlTitle = (path: string) => {
  if (path.startsWith('/sign-in') || path.startsWith('/callback') || path.startsWith('/consent')) {
    return i18next.t<'translation', TFuncKey>('description.sign_in');
  }

  if (path.startsWith('/register') || path.startsWith('/social/link')) {
    return i18next.t<'translation', TFuncKey>('description.create_account');
  }

  if (path.startsWith('/forgot-password')) {
    return i18next.t<'translation', TFuncKey>('description.reset_password');
  }

  // Return undefined for all continue flow pages to keep title remain the same as the previous page
  if (path.startsWith('/continue')) {
    return;
  }

  return 'Logto';
};

export const setFavIcon = (icon?: string) => {
  const iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const appleTouchIconLink = document.querySelector<HTMLLinkElement>(
    'link[rel="apple-touch-icon"]'
  );

  /* eslint-disable @silverhand/fp/no-mutation */

  if (iconLink) {
    iconLink.href = icon ?? defaultFavicon;
  } else {
    const favIconLink = document.createElement('link');
    favIconLink.rel = 'shortcut icon';
    favIconLink.href = icon ?? defaultFavicon;
    document.querySelectorAll('head')[0]?.append(favIconLink);
  }

  if (appleTouchIconLink) {
    appleTouchIconLink.href = icon ?? defaultAppleTouchLogo;
  } else {
    const appleTouchIconLink = document.createElement('link');
    appleTouchIconLink.rel = 'apple-touch-icon';
    appleTouchIconLink.href = icon ?? defaultAppleTouchLogo;
    appleTouchIconLink.setAttribute('sizes', '180x180');
    document.querySelectorAll('head')[0]?.append(appleTouchIconLink);
  }

  /* eslint-enable @silverhand/fp/no-mutation */
};
