/**
 * Temp Solution for getting the sign in experience
 * TODO: Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInMethods, SignInExperience } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import { ConnectorData, SignInMethod, SignInExperienceSettings } from '@/types';

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

const getSignInExperienceSettings = async <
  T extends SignInExperience & { socialConnectors: ConnectorData[] }
>(): Promise<SignInExperienceSettings> => {
  const { branding, languageInfo, termsOfUse, signInMethods, socialConnectors } =
    await getSignInExperience<T>();

  return {
    branding,
    languageInfo,
    termsOfUse,
    primarySignInMethod: getPrimarySignInMethod(signInMethods),
    secondarySignInMethods: getSecondarySignInMethods(signInMethods),
    socialConnectors,
  };
};

export default getSignInExperienceSettings;
