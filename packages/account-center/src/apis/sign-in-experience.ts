import ky from 'ky';

import type { SignInExperienceResponse } from '@/types/sign-in-experience';

export const getSignInExperienceSettings = async (): Promise<SignInExperienceResponse> => {
  return ky.get('/api/.well-known/sign-in-exp').json<SignInExperienceResponse>();
};
