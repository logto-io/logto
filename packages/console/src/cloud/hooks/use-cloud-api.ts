import type router from '@logto/cloud/routes';
import { useLogto } from '@logto/react';
import { conditional } from '@silverhand/essentials';
import Client, { ResponseError } from '@withtyped/client';
import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import { cloudApi } from '@/consts';

export const responseErrorBodyGuard = z.object({
  message: z.string(),
});

export const toastResponseError = async (error: unknown) => {
  if (error instanceof ResponseError) {
    const parsed = responseErrorBodyGuard.safeParse(await error.response.json());
    toast.error(parsed.success ? parsed.data.message : error.message);
    return;
  }

  toast(error instanceof Error ? error.message : String(error));
};

type UseCloudApiProps = {
  hideErrorToast?: boolean;
};

export const useCloudApi = ({ hideErrorToast = false }: UseCloudApiProps = {}): Client<
  typeof router
> => {
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
        before: {
          ...conditional(!hideErrorToast && { error: toastResponseError }),
        },
      }),
    [getAccessToken, hideErrorToast, isAuthenticated]
  );

  return api;
};
