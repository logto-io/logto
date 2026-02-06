import { type IdTokenConfig } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';

type UseIdTokenConfigOptions = {
  enabled?: boolean;
};

const useIdTokenConfig = ({ enabled = true }: UseIdTokenConfigOptions = {}) => {
  const { data, error, isLoading, mutate } = useSWR<IdTokenConfig, RequestError>(
    enabled ? 'api/configs/id-token' : null
  );

  const api = useApi();

  return useMemo(
    () => ({
      data,
      error,
      isLoading: enabled && isLoading,
      mutate,
      updateConfig: async (config: IdTokenConfig) => {
        const updated = await api
          .put('api/configs/id-token', { json: config })
          .json<IdTokenConfig>();
        void mutate(updated);
        return updated;
      },
    }),
    [api, data, enabled, error, isLoading, mutate]
  );
};

export default useIdTokenConfig;
