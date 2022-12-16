import type { UserProfileResponse } from '@logto/schemas';

import api from './api';

const profileApiPrefix = '/api/profile';

export const getUserProfile = async (): Promise<UserProfileResponse> =>
  api.get(profileApiPrefix).json<UserProfileResponse>();
