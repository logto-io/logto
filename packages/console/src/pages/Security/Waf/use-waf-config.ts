import { useLogto } from '@logto/react';
import type { WafConfig } from '@logto/schemas';
import useSWR from 'swr';

import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';

const useWafConfig = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const shouldFetch = isAuthenticated && !authError;
  const { data, error, isLoading, mutate } = useSWR<WafConfig, RequestError>(
    shouldFetch && 'api/configs/waf'
  );
  const api = useApi();

  const updateWafConfig = async (waf: WafConfig) => {
    const updated = await api.patch('api/configs/waf', { json: waf }).json<WafConfig>();
    void mutate(updated);
  };

  return { data, error, isLoading: isLoading && !error, mutate, updateWafConfig };
};

export default useWafConfig;
