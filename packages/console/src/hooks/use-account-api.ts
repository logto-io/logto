import { httpCodeToMessage } from '@logto/core-kit';
import type { LogtoErrorCode } from '@logto/phrases';
import { useLogto } from '@logto/react';
import type { RequestErrorBody } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import ky from 'ky';
import { type KyInstance } from 'node_modules/ky/distribution/types/ky';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { requestTimeout, adminTenantEndpoint } from '@/consts';

import useRedirectUri from './use-redirect-uri';
import useSignOut from './use-sign-out';

type AccountApiProps = {
  hideErrorToast?: boolean | LogtoErrorCode[];
  timeout?: number;
  signal?: AbortSignal;
};

const useGlobalRequestErrorHandler = (toastDisabledErrorCodes?: LogtoErrorCode[]) => {
  const { signOut } = useSignOut();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const postSignOutRedirectUri = useRedirectUri('signOut');

  const handleError = useCallback(
    async (response: Response) => {
      const fallbackErrorMessage = t('errors.unknown_server_error');

      try {
        const data = await response.clone().json<RequestErrorBody>();

        if (response.status === 403 && data.message === 'Insufficient permissions.') {
          await signOut(postSignOutRedirectUri.href);
          return;
        }

        if (toastDisabledErrorCodes?.includes(data.code)) {
          return;
        }

        toast.error([data.message, data.details].join('\n') || fallbackErrorMessage);
      } catch {
        toast.error(httpCodeToMessage[response.status] ?? fallbackErrorMessage);
      }
    },
    [t, toastDisabledErrorCodes, signOut, postSignOutRedirectUri.href]
  );

  return { handleError };
};

/**
 * A hook to get a Ky instance for calling the Account API (/api/my-account).
 * The Account API uses OIDC opaque access tokens (no resource indicator).
 */
const useAccountApi = ({
  hideErrorToast,
  timeout = requestTimeout,
  signal,
}: AccountApiProps = {}): KyInstance => {
  const { isAuthenticated, getAccessToken } = useLogto();
  const { i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const disableGlobalErrorHandling = hideErrorToast === true;
  const toastDisabledErrorCodes = Array.isArray(hideErrorToast) ? hideErrorToast : undefined;
  const { handleError } = useGlobalRequestErrorHandler(toastDisabledErrorCodes);

  const api = useMemo(
    () =>
      ky.create({
        prefixUrl: adminTenantEndpoint,
        timeout,
        signal,
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
                // Get opaque access token without resource indicator for Account API
                const accessToken = await getAccessToken();
                request.headers.set('Authorization', `Bearer ${accessToken ?? ''}`);
                request.headers.set('Accept-Language', i18n.language);
              }
            },
          ],
        },
      }),
    [
      timeout,
      signal,
      disableGlobalErrorHandling,
      handleError,
      isAuthenticated,
      getAccessToken,
      i18n.language,
    ]
  );

  return api;
};

export default useAccountApi;
