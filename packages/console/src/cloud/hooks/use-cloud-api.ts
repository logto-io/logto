import { useLogto } from '@logto/react';
import ky from 'ky';
import { useMemo } from 'react';

import { cloudApi } from '@/consts';

export const useCloudApi = () => {
  const { isAuthenticated, getAccessToken } = useLogto();
  const api = useMemo(
    () =>
      ky.create({
        hooks: {
          beforeRequest: [
            async (request) => {
              if (isAuthenticated) {
                const accessToken = await getAccessToken(cloudApi.indicator);
                request.headers.set('Authorization', `Bearer ${accessToken ?? ''}`);
              }
            },
          ],
        },
      }),
    [getAccessToken, isAuthenticated]
  );

  return api;
};
