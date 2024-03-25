import {
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  httpCodeToMessage,
  organizationUrnPrefix,
} from '@logto/core-kit';
import { type LogtoErrorCode } from '@logto/phrases';
import { useLogto } from '@logto/react';
import {
  getTenantOrganizationId,
  type RequestErrorBody,
  getManagementApiResourceIndicator,
  defaultTenantId,
} from '@logto/schemas';
import { appendPath, conditionalArray } from '@silverhand/essentials';
import ky from 'ky';
import { type KyInstance } from 'node_modules/ky/distribution/types/ky';
import { useCallback, useContext, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { requestTimeout } from '@/consts';
import { isCloud } from '@/consts/env';
import { AppDataContext } from '@/contexts/AppDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';

import { useConfirmModal } from './use-confirm-modal';
import useRedirectUri from './use-redirect-uri';

export class RequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body?: RequestErrorBody
  ) {
    super('Request error occurred.');
  }
}

export type StaticApiProps = {
  prefixUrl?: URL;
  hideErrorToast?: boolean | LogtoErrorCode[];
  resourceIndicator: string;
};

const useGlobalRequestErrorHandler = (toastDisabledErrorCodes?: LogtoErrorCode[]) => {
  const { signOut } = useLogto();
  const { show } = useConfirmModal();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const postSignOutRedirectUri = useRedirectUri('signOut');

  const handleError = useCallback(
    async (response: Response) => {
      const fallbackErrorMessage = t('errors.unknown_server_error');

      try {
        // Clone the response to avoid "Response body is already used".
        const data = await response.clone().json<RequestErrorBody>();

        // This is what will happen when the user still has the legacy refresh token without
        // organization scope. We should sign them out and redirect to the sign in page.
        // TODO: This is a temporary solution to prevent the user from getting stuck in Console,
        // which can be removed after all legacy refresh tokens are expired, i.e. after Jan 10th,
        // 2024.
        if (response.status === 403 && data.message === 'Insufficient permissions.') {
          await signOut(postSignOutRedirectUri.href);
          return;
        }

        // Inform and redirect un-authorized users to sign in page.
        if (data.code === 'auth.forbidden') {
          await show({
            ModalContent: data.message,
            type: 'alert',
            cancelButtonText: 'general.got_it',
          });

          await signOut(postSignOutRedirectUri.href);
          return;
        }

        // Skip showing toast for specific error codes.
        if (toastDisabledErrorCodes?.includes(data.code)) {
          return;
        }

        toast.error([data.message, data.details].join('\n') || fallbackErrorMessage);
      } catch {
        toast.error(httpCodeToMessage[response.status] ?? fallbackErrorMessage);
      }
    },
    [t, toastDisabledErrorCodes, signOut, postSignOutRedirectUri.href, show]
  );

  return {
    handleError,
  };
};

/**
 *
 * @param {StaticApiProps} props
 * @param {URL} props.prefixUrl  The base URL for the API.
 * @param {boolean} props.hideErrorToast  Whether to disable the global error handling.
 * @param {string} props.resourceIndicator  The resource indicator for the API. Used by the Logto SDK to validate the access token.
 *
 * @returns
 */
export const useStaticApi = ({
  prefixUrl,
  hideErrorToast,
  resourceIndicator,
}: StaticApiProps): KyInstance => {
  const { isAuthenticated, getAccessToken, getOrganizationToken } = useLogto();
  const { i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Disable global error handling if `hideErrorToast` is true.
  const disableGlobalErrorHandling = hideErrorToast === true;
  // Disable toast for specific error codes.
  const toastDisabledErrorCodes = Array.isArray(hideErrorToast) ? hideErrorToast : undefined;

  const { handleError } = useGlobalRequestErrorHandler(toastDisabledErrorCodes);

  const api = useMemo(
    () =>
      ky.create({
        prefixUrl,
        timeout: requestTimeout,
        hooks: {
          beforeError: conditionalArray(
            !disableGlobalErrorHandling &&
              (async (error) => {
                await handleError(error.response);
                return error;
              })
          ),
          beforeRequest: [
            async (request) => {
              if (isAuthenticated) {
                const accessToken = await (resourceIndicator.startsWith(organizationUrnPrefix)
                  ? getOrganizationToken(getOrganizationIdFromUrn(resourceIndicator))
                  : getAccessToken(resourceIndicator));
                request.headers.set('Authorization', `Bearer ${accessToken ?? ''}`);
                request.headers.set('Accept-Language', i18n.language);
              }
            },
          ],
        },
      }),
    [
      prefixUrl,
      disableGlobalErrorHandling,
      handleError,
      isAuthenticated,
      resourceIndicator,
      getOrganizationToken,
      getAccessToken,
      i18n.language,
    ]
  );

  return api;
};

/** A hook to get a Ky instance with the current tenant's Management API prefix URL. */
const useApi = (props: Omit<StaticApiProps, 'prefixUrl' | 'resourceIndicator'> = {}) => {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { currentTenantId } = useContext(TenantsContext);
  /**
   * The config object for the Ky instance.
   *
   * - In Cloud, it uses the Management API proxy endpoint with tenant organization tokens.
   * - In OSS, it directly uses the tenant endpoint (Management API).
   *
   * Since we removes all user roles for the Management API except the one for the default tenant,
   * the OSS version should be used for the default tenant only.
   */
  const config = useMemo(
    () =>
      isCloud
        ? {
            prefixUrl: appendPath(new URL(window.location.origin), 'm', currentTenantId),
            resourceIndicator: buildOrganizationUrn(getTenantOrganizationId(currentTenantId)),
          }
        : {
            prefixUrl: tenantEndpoint,
            resourceIndicator: getManagementApiResourceIndicator(currentTenantId),
          },
    [currentTenantId, tenantEndpoint]
  );

  if (!isCloud && currentTenantId !== defaultTenantId) {
    throw new Error('Only the default tenant is supported in OSS.');
  }

  return useStaticApi({
    ...props,
    ...config,
  });
};

export default useApi;
