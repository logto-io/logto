import type router from '@logto/cloud/routes';
import { useLogto } from '@logto/react';
import Client from '@withtyped/client';
import { useMemo } from 'react';

import { cloudApi } from '@/consts';

export const useCloudApi = (): Client<typeof router> => {
  const { isAuthenticated, getAccessToken } = useLogto();
  const api = useMemo(
    () =>
      new Client<typeof router>({
        baseUrl: window.location.origin,
        headers: async () => {
          if (isAuthenticated) {
            return { Authorization: `Bearer ${(await getAccessToken(cloudApi.indicator)) ?? ''}` };
          }
        },
      }),
    [getAccessToken, isAuthenticated]
  );

  return api;
};
