import { useLogto } from '@logto/react';
import { RequestErrorBody } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { t } from 'i18next';
import ky from 'ky';
import { useMemo } from 'react';
import { toast } from 'react-hot-toast';

import { logtoApiResource } from '@/consts/api';

export class RequestError extends Error {
  body: RequestErrorBody;

  constructor(body: RequestErrorBody) {
    super('Request error occurred.');
    this.body = body;
  }
}

const toastError = async (response: Response) => {
  try {
    const data = await response.json<RequestErrorBody>();
    toast.error(data.message || t('admin_console.errors.unknown_server_error'));
  } catch {
    toast.error(t('admin_console.errors.unknown_server_error'));
  }
};

type Props = {
  hideErrorToast?: boolean;
};

const useApi = ({ hideErrorToast }: Props = {}) => {
  const { isAuthenticated, getAccessToken } = useLogto();

  const api = useMemo(
    () =>
      ky.create({
        hooks: {
          beforeError: conditional(
            !hideErrorToast && [
              (error) => {
                const { response } = error;

                void toastError(response);

                return error;
              },
            ]
          ),
          beforeRequest: [
            async (request) => {
              if (isAuthenticated) {
                const accessToken = await getAccessToken(logtoApiResource);
                request.headers.set('Authorization', `Bearer ${accessToken ?? ''}`);
              }
            },
          ],
        },
      }),
    [getAccessToken, isAuthenticated, hideErrorToast]
  );

  return api;
};

export default useApi;
