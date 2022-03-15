import { useLogto } from '@logto/react';
import { RequestErrorBody, RequestErrorMetadata } from '@logto/schemas';
import { t } from 'i18next';
import ky from 'ky';
import { useMemo } from 'react';
import { toast } from 'react-hot-toast';

import { logtoApiResource } from '@/consts/api';

export class RequestError extends Error {
  metadata: RequestErrorMetadata;

  constructor(metadata: RequestErrorMetadata) {
    super('Request error occurred.');
    this.metadata = metadata;
  }
}

const toastError = async (response: Response) => {
  try {
    const data = (await response.json()) as RequestErrorBody;
    toast.error(data.message || t('admin_console.errors.unknown_server_error'));
  } catch {
    toast.error(t('admin_console.errors.unknown_server_error'));
  }
};

const useApi = () => {
  const { isAuthenticated, getAccessToken } = useLogto();

  const api = useMemo(
    () =>
      ky.create({
        hooks: {
          beforeError: [
            (error) => {
              const { response } = error;

              void toastError(response);

              return error;
            },
          ],
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
    [getAccessToken, isAuthenticated]
  );

  return api;
};

export default useApi;
