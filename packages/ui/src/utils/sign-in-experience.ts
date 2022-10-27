/**
 * Temp Solution for getting the sign in experience
 * Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInIdentifier, SignUpIdentifier } from '@logto/schemas';

import { getSignInExperience } from '@/apis/settings';
import type { SignInExperienceSettings, SignInExperienceResponse } from '@/types';
import { filterSocialConnectors } from '@/utils/social-connectors';

export const signUpIdentifierMap: Record<SignUpIdentifier, SignInIdentifier[]> = {
  [SignUpIdentifier.Username]: [SignInIdentifier.Username],
  [SignUpIdentifier.Email]: [SignInIdentifier.Email],
  [SignUpIdentifier.Sms]: [SignInIdentifier.Sms],
  [SignUpIdentifier.EmailOrSms]: [SignInIdentifier.Email, SignInIdentifier.Sms],
  [SignUpIdentifier.None]: [],
};

const parseSignInExperienceResponse = (
  response: SignInExperienceResponse
): SignInExperienceSettings => {
  const { socialConnectors, signUp, ...rest } = response;
  const { identifier, ...signUpSettings } = signUp;

  return {
    ...rest,
    socialConnectors: filterSocialConnectors(socialConnectors),
    signUp: {
      methods: signUpIdentifierMap[identifier],
      ...signUpSettings,
    },
  };
};

export const getSignInExperienceSettings = async (): Promise<SignInExperienceSettings> => {
  const response = await getSignInExperience<SignInExperienceResponse>();

  return parseSignInExperienceResponse(response);
};

export const getSupportedPasswordlessMethods = (settings: SignInExperienceSettings) => {
  const signUpPasswordlessMethods = settings.signUp.verify
    ? settings.signUp.methods.filter(
        (identifier) => identifier === SignInIdentifier.Email || identifier === SignInIdentifier.Sms
      )
    : [];

  const signInPasswordlessMethods = settings.signIn.methods
    .filter(
      ({ identifier, verificationCode }) =>
        verificationCode &&
        (identifier === SignInIdentifier.Email || identifier === SignInIdentifier.Sms)
    )
    .map(({ identifier }) => identifier);

  return new Set([...signUpPasswordlessMethods, ...signInPasswordlessMethods]);
};
