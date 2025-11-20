import type { UserProfileResponse } from '@logto/schemas';
import ky from 'ky';

export const getUserInfo = async (accessToken: string) => {
  return ky
    .get('/api/my-account', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json<Partial<UserProfileResponse>>();
};
