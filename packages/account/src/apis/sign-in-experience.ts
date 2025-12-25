import type { SignInExperienceResponse } from '@experience/shared/types';
import ky from 'ky';

export const getSignInExperienceSettings = async (): Promise<SignInExperienceResponse> => {
  return ky.get('/api/.well-known/sign-in-exp').json<SignInExperienceResponse>();
};
