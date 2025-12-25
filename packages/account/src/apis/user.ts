import type { UserProfileResponse } from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const getUserInfo = async (accessToken: string) => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account')
    .json<Partial<UserProfileResponse>>();
};
