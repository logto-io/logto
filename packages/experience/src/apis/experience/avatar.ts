import type { UserAssets } from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes } from './const';

export const uploadAvatar = async (file: File, options?: { signal?: AbortSignal }) => {
  const formData = new FormData();
  formData.append('file', file);

  return api
    .post(`${experienceApiRoutes.prefix}/user-assets/avatar`, {
      body: formData,
      signal: options?.signal,
    })
    .json<UserAssets>();
};
