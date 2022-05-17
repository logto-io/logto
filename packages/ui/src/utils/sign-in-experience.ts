/**
 * Temp Solution for getting the sign in experience
 * TODO: Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInMethods } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import { SignInMethod, SignInExperienceSettingsResponse, SignInExperienceSettings } from '@/types';

const getPrimarySignInMethod = (signInMethods: SignInMethods) => {
  for (const [key, value] of Object.entries(signInMethods)) {
    if (value === 'primary') {
      return key as keyof SignInMethods;
    }
  }

  return 'username';
};

const getSecondarySignInMethods = (signInMethods: SignInMethods) =>
  Object.entries(signInMethods).reduce<SignInMethod[]>((methods, [key, value]) => {
    if (value === 'secondary') {
      return [...methods, key as SignInMethod];
    }

    return methods;
  }, []);

export const parseSignInExperienceSettings = ({
  signInMethods,
  ...rest
}: SignInExperienceSettingsResponse) => ({
  ...rest,
  primarySignInMethod: getPrimarySignInMethod(signInMethods),
  secondarySignInMethods: getSecondarySignInMethods(signInMethods),
});

const getSignInExperienceSettings = async (): Promise<SignInExperienceSettings> => {
  const response = await getSignInExperience<SignInExperienceSettingsResponse>();

  return parseSignInExperienceSettings(response);
};

export default getSignInExperienceSettings;
