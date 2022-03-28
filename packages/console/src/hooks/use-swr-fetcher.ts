import { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useCallback } from 'react';
import { BareFetcher } from 'swr';

import useApi, { RequestError } from './use-api';

const useSwrFetcher = () => {
  const api = useApi({ hideErrorToast: true });
  const fetcher = useCallback<BareFetcher>(
    async (resource, init) => {
      try {
        const response = await api.get(resource, init);

        return await response.json();
      } catch (error: unknown) {
        if (error instanceof HTTPError) {
          const { response } = error;
          const metadata = await response.json<RequestErrorBody>();
          throw new RequestError(metadata);
        }
        throw error;
      }
    },
    [api]
  );

  return fetcher;
};

export default useSwrFetcher;
