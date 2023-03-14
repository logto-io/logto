import { useLogto } from '@logto/react';
import type { RequestErrorBody } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import ky from 'ky';
import { useCallback, useContext, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { getBasename, getManagementApi, requestTimeout } from '@/consts';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';

import { useConfirmModal } from './use-confirm-modal';

export class RequestError extends Error {
  constructor(public readonly status: number, public readonly body?: RequestErrorBody) {
    super('Request error occurred.');
  }
}

type StaticApiProps = {
  prefixUrl?: URL;
  hideErrorToast?: boolean;
  resourceIndicator?: string;
};

export const useStaticApi = ({
  prefixUrl,
  hideErrorToast,
  resourceIndicator: resourceInput,
}: StaticApiProps) => {
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const { currentTenantId } = useContext(TenantsContext);
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { show } = useConfirmModal();
  const resourceIndicator = useMemo(
    () => resourceInput ?? getManagementApi(currentTenantId).indicator,
    [currentTenantId, resourceInput]
  );

  const toastError = useCallback(
    async (response: Response) => {
      const fallbackErrorMessage = t('errors.unknown_server_error');

      try {
        const data = await response.json<RequestErrorBody>();

        // Inform and redirect un-authorized users to sign in page.
        if (data.code === 'auth.forbidden') {
          await show({
            ModalContent: data.message,
            type: 'alert',
            cancelButtonText: 'general.got_it',
          });

          await signOut(new URL(getBasename(), window.location.origin).toString());

          return;
        }

        toast.error([data.message, data.details].join('\n') || fallbackErrorMessage);
      } catch {
        toast.error(fallbackErrorMessage);
      }
    },
    [show, signOut, t]
  );

  const api = useMemo(
    () =>
      ky.create({
        prefixUrl,
        timeout: requestTimeout,
        hooks: {
          beforeError: conditionalArray(
            !hideErrorToast &&
              (async (error) => {
                await toastError(error.response);

                return error;
              })
          ),
          beforeRequest: [
            async (request) => {
              if (isAuthenticated) {
                const accessToken = await getAccessToken(resourceIndicator);
                request.headers.set('Authorization', `Bearer ${accessToken ?? ''}`);
                request.headers.set('Accept-Language', i18n.language);
              }
            },
          ],
        },
      }),
    [
      prefixUrl,
      hideErrorToast,
      toastError,
      isAuthenticated,
      getAccessToken,
      resourceIndicator,
      i18n.language,
    ]
  );

  return api;
};

const useApi = (props: Omit<StaticApiProps, 'prefixUrl'> = {}) => {
  const { userEndpoint } = useContext(AppEndpointsContext);

  return useStaticApi({ ...props, prefixUrl: userEndpoint });
};

export default useApi;
