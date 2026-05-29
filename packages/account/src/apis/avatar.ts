import type { UserAssets } from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export const uploadAccountAvatar = async (
  accessToken: string,
  file: File,
  options?: { signal?: AbortSignal }
) => {
  const formData = new FormData();
  formData.append('file', file);

  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/user-assets/avatar', {
      body: formData,
      signal: options?.signal,
    })
    .json<UserAssets>();
};
