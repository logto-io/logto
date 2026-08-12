import type router from '@logto/cloud/routes';
import { type emailLogsRouter, type tenantAuthRouter } from '@logto/cloud/routes';
import { useLogto } from '@logto/react';
import { getTenantOrganizationId } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import Client, { ResponseError } from '@withtyped/client';
import { useContext, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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

/**
 * The routers the cloud API exposes to the console under the same access token. Routers outside
 * the default one are standalone on the cloud side (split to stay under TypeScript's
 * type-instantiation depth limit), so the client type is selected per call site instead of
 * intersecting them.
 */
type ConsoleCloudRouter = typeof router | typeof emailLogsRouter;

export const useCloudApi = <R extends ConsoleCloudRouter = typeof router>({
  hideErrorToast = false,
}: UseCloudApiProps = {}): Client<R> => {
  const { i18n } = useTranslation();
  const { isAuthenticated, getAccessToken } = useLogto();
  const api = useMemo(
    () =>
      new Client<R>({
        baseUrl: window.location.origin,
        headers: async () => {
          if (isAuthenticated) {
            return {
              Authorization: `Bearer ${(await getAccessToken(cloudApi.indicator)) ?? ''}`,
              'Accept-Language': i18n.language,
            };
          }
        },
        before: {
          ...conditional(!hideErrorToast && { error: toastResponseError }),
        },
      }),
    [getAccessToken, hideErrorToast, i18n.language, isAuthenticated]
  );

  return api;
};

type CreateTenantOptions = UseCloudApiProps &
  Pick<ReturnType<typeof useLogto>, 'isAuthenticated' | 'getOrganizationToken'> & {
    tenantId: string;
    language: string;
  };

export const createTenantApi = ({
  hideErrorToast = false,
  isAuthenticated,
  getOrganizationToken,
  tenantId,
  language,
}: CreateTenantOptions): Client<typeof tenantAuthRouter> =>
  new Client<typeof tenantAuthRouter>({
    baseUrl: window.location.origin,
    headers: async () => {
      if (isAuthenticated) {
        return {
          Authorization: `Bearer ${
            (await getOrganizationToken(getTenantOrganizationId(tenantId))) ?? ''
          }`,
          'Accept-Language': language,
        };
      }
    },
    before: {
      ...conditional(!hideErrorToast && { error: toastResponseError }),
    },
  });

/**
 * This hook is used to request the cloud `tenantAuthRouter` endpoints, with an organization token.
 */
export const useAuthedCloudApi = ({ hideErrorToast = false }: UseCloudApiProps = {}): Client<
  typeof tenantAuthRouter
> => {
  const { i18n } = useTranslation();
  const { currentTenantId } = useContext(TenantsContext);
  const { isAuthenticated, getOrganizationToken } = useLogto();
  const api = useMemo(
    () =>
      createTenantApi({
        hideErrorToast,
        isAuthenticated,
        getOrganizationToken,
        tenantId: currentTenantId,
        language: i18n.language,
      }),
    [currentTenantId, getOrganizationToken, hideErrorToast, isAuthenticated, i18n.language]
  );

  return api;
};
