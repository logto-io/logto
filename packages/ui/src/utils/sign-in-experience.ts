import { SignInMethods } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import { SignInMethod, SignInExperienceSettingsResponse, SignInExperienceSettings } from '@/types';
import { filterSocialConnectors } from '@/utils/social-connectors';

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
