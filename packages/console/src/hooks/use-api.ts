import { useLogto } from '@logto/react';
import type { RequestErrorBody } from '@logto/schemas';
import ky from 'ky';
import { useCallback, useContext, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { managementApi, requestTimeout } from '@/consts';
import type { AppEndpointKey } from '@/containers/AppEndpointsProvider';
import { AppEndpointsContext } from '@/containers/AppEndpointsProvider';

export class RequestError extends Error {
  status: number;
  body?: RequestErrorBody;

  constructor(status: number, body: RequestErrorBody) {
    super('Request error occurred.');
    this.status = status;
    this.body = body;
  }
}

type Props = {
  endpointKey?: AppEndpointKey;
  hideErrorToast?: boolean;
  resourceIndicator?: string;
};

const useApi = ({
  hideErrorToast,
  endpointKey = 'app',
  resourceIndicator = managementApi.indicator,
}: Props = {}) => {
  const endpoints = useContext(AppEndpointsContext);
  const { isAuthenticated, getAccessToken } = useLogto();
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const toastError = useCallback(
    async (response: Response) => {
      const fallbackErrorMessage = t('errors.unknown_server_error');

      try {
        const data = await response.json<RequestErrorBody>();
        toast.error([data.message, data.details].join('\n') || fallbackErrorMessage);
      } catch {
        toast.error(fallbackErrorMessage);
      }
    },
    [t]
  );

  const api = useMemo(
    () =>
      ky.create({
        prefixUrl: endpoints[endpointKey],
        timeout: requestTimeout,
        hooks: {
          beforeError: hideErrorToast
            ? []
            : [
                (error) => {
                  void toastError(error.response);

                  return error;
                },
              ],
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
      endpoints,
      endpointKey,
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

export default useApi;
