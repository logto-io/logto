/**
 * Temp Solution for getting the sign in experience
 * Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInMethods } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import { SignInMethod, SignInExperienceSettingsResponse, SignInExperienceSettings } from '@/types';
import { filterSocialConnectors } from '@/utils/social-connectors';

import { entries } from '.';

export const getPrimarySignInMethod = (signInMethods: SignInMethods) => {
  for (const [key, value] of entries(signInMethods)) {
    if (value === 'primary') {
      return key;
    }
  }

  return 'username';
};

export const getSecondarySignInMethods = (signInMethods: SignInMethods) =>
  entries(signInMethods).reduce<SignInMethod[]>((methods, [key, value]) => {
    if (value === 'secondary') {
      return [...methods, key];
    }

    return methods;
  }, []);

export const getSignInExperienceSettings = async (): Promise<SignInExperienceSettings> => {
  const { signInMethods, socialConnectors, ...rest } =
    await getSignInExperience<SignInExperienceSettingsResponse>();

  return {
    ...rest,
    primarySignInMethod: getPrimarySignInMethod(signInMethods),
    secondarySignInMethods: getSecondarySignInMethods(signInMethods),
    socialConnectors: filterSocialConnectors(socialConnectors),
  };
};
