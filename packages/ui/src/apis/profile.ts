import type { UserInfo } from '@logto/schemas';

import api from './api';

const profileApiPrefix = '/api/profile';

export const getUserProfile = async (): Promise<UserInfo> =>
  api.get(profileApiPrefix).json<UserInfo>();
