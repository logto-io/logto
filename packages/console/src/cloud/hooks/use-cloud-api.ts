import type router from '@logto/cloud/routes';
import { type tenantAuthRouter } from '@logto/cloud/routes';
import { useLogto } from '@logto/react';
import { getTenantOrganizationId } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import Client, { ResponseError } from '@withtyped/client';
import { useContext, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import { cloudApi } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

const responseErrorBodyGuard = z.object({
  message: z.string(),
});

export const tryReadResponseErrorBody = async (error: ResponseError) =>
  trySafe(async () => {
    // Clone the response to avoid blocking later usage since the response body can only be read once
    const responseBody = await error.response.clone().json();
    return responseErrorBodyGuard.parse(responseBody);
  });

export const toastResponseError = async (error: unknown) => {
  if (error instanceof ResponseError) {
    const responseBody = await tryReadResponseErrorBody(error);
    if (responseBody) {
      toast.error(responseBody.message);
      return;
    }
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

/**
 * This hook is used to request the cloud `tenantAuthRouter` endpoints, with an organization token.
 */
export const useAuthedCloudApi = ({ hideErrorToast = false }: UseCloudApiProps = {}): Client<
  typeof tenantAuthRouter
> => {
  const { currentTenantId } = useContext(TenantsContext);
  const { isAuthenticated, getOrganizationToken } = useLogto();
  const api = useMemo(
    () =>
      new Client<typeof tenantAuthRouter>({
        baseUrl: window.location.origin,
        headers: async () => {
          if (isAuthenticated) {
            return {
              Authorization: `Bearer ${
                (await getOrganizationToken(getTenantOrganizationId(currentTenantId))) ?? ''
              }`,
            };
          }
        },
        before: {
          ...conditional(!hideErrorToast && { error: toastResponseError }),
        },
      }),
    [currentTenantId, getOrganizationToken, hideErrorToast, isAuthenticated]
  );

  return api;
};
