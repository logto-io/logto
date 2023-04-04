/**
 * Temp Solution for getting the sign in experience
 * Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInIdentifier } from '@logto/schemas';
import i18next from 'i18next';

import { getSignInExperience } from '@/apis/settings';
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
  // Will update soon, remove generic of `.t()` to unblock
  if (path.startsWith('/sign-in') || path.startsWith('/callback') || path.startsWith('/consent')) {
    return i18next.t('description.sign_in');
  }

  if (path.startsWith('/register') || path.startsWith('/social/link')) {
    return i18next.t('description.create_account');
  }

  if (path.startsWith('/forgot-password')) {
    return i18next.t('description.reset_password');
  }

  // Return undefined for all continue flow pages to keep title remain the same as the previous page
  if (path.startsWith('/continue')) {
    return;
  }

  return 'Logto';
};
