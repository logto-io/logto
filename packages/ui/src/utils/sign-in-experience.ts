/**
 * Temp Solution for getting the sign in experience
 * TODO: Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInMethods } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import { isAppleConnector } from '@/hooks/use-apple-auth';
import { filterSocialConnectors } from '@/hooks/utils';
import { SignInMethod, SignInExperienceSettingsResponse, SignInExperienceSettings } from '@/types';

export const getPrimarySignInMethod = (signInMethods: SignInMethods) => {
  for (const [key, value] of Object.entries(signInMethods)) {
    if (value === 'primary') {
      return key as keyof SignInMethods;
    }
  }

  return 'username';
};

export const getSecondarySignInMethods = (signInMethods: SignInMethods) =>
  Object.entries(signInMethods).reduce<SignInMethod[]>((methods, [key, value]) => {
    if (value === 'secondary') {
      return [...methods, key as SignInMethod];
    }

    return methods;
  }, []);

export const isAppleConnectorEnabled = ({
  primarySignInMethod,
  secondarySignInMethods,
  socialConnectors,
}: SignInExperienceSettings) =>
  (primarySignInMethod === 'social' || secondarySignInMethods.includes('social')) &&
  socialConnectors.some((connector) => isAppleConnector(connector));

const getSignInExperienceSettings = async (): Promise<SignInExperienceSettings> => {
  const { signInMethods, socialConnectors, ...rest } =
    await getSignInExperience<SignInExperienceSettingsResponse>();

  return {
    ...rest,
    primarySignInMethod: getPrimarySignInMethod(signInMethods),
    secondarySignInMethods: getSecondarySignInMethods(signInMethods),
    socialConnectors: filterSocialConnectors(socialConnectors),
  };
};

export default getSignInExperienceSettings;
