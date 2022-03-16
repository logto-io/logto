import { RequestErrorMetadata } from '@logto/schemas';
import { useCallback } from 'react';
import { BareFetcher } from 'swr';

import useApi, { RequestError } from './use-api';

const useSwrFetcher = () => {
  const api = useApi();
  const fetcher = useCallback<BareFetcher>(
    async (resource, init) => {
      const response = await api.get(resource, init);

      if (!response.ok) {
        const metadata = (await response.json()) as RequestErrorMetadata;
        throw new RequestError(metadata);
      }

      return response.json();
    },
    [api]
  );

  return fetcher;
};

export default useSwrFetcher;
