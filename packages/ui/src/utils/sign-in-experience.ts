/**
 * Temp Solution for getting the sign in experience
 * TODO: Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInMethods } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import { SignInMethod, SignInExperienceSettings } from '@/types';

const getPrimarySignInMethod = (signInMethods: SignInMethods) => {
  for (const [key, value] of Object.entries(signInMethods)) {
    if (value === 'primary') {
      return key as keyof SignInMethods;
    }
  }

  return 'username';
};

const getSecondarySignInMethod = (signInMethods: SignInMethods) =>
  Object.entries(signInMethods).reduce<SignInMethod[]>((methods, [key, value]) => {
    if (value === 'secondary') {
      return [...methods, key as SignInMethod];
    }

    return methods;
  }, []);

const getSignInExperienceSettings = async (): Promise<SignInExperienceSettings> => {
  const result = await getSignInExperience();

  return {
    branding: result.branding,
    languageInfo: result.languageInfo,
    termsOfUse: result.termsOfUse,
    primarySignInMethod: getPrimarySignInMethod(result.signInMethods),
    secondarySignInMethods: getSecondarySignInMethod(result.signInMethods),
  };
};

export default getSignInExperienceSettings;
