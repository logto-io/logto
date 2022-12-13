/**
 * Temp Solution for getting the sign in experience
 * Remove this once we have a better way to get the sign in experience through SSR
 */

import { SignInIdentifier } from '@logto/schemas';

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

export const isEmailOrSmsMethod = (
  method: SignInIdentifier
): method is SignInIdentifier.Email | SignInIdentifier.Sms =>
  [SignInIdentifier.Email, SignInIdentifier.Sms].includes(method);
