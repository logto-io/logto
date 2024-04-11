import { LogtoJwtTokenKey, type JwtCustomizerConfigs } from '@logto/schemas';
import { type ResponseError } from '@withtyped/client';
import { useMemo } from 'react';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';

import { getApiPath } from './utils/path';

function useJwtCustomizer() {
  const fetchApi = useApi({ hideErrorToast: true });

  const fetcher = useSwrFetcher<JwtCustomizerConfigs[]>(fetchApi);
  const {
    data,
    isLoading: isDataLoading,
    error,
    mutate,
  } = useSWR<JwtCustomizerConfigs[], ResponseError>(getApiPath(), {
    fetcher,
  });
  const isLoading = isDataLoading && !error;

  return useMemo(() => {
    const { value: accessTokenJwtCustomizer } =
      data?.find(({ key }) => key === LogtoJwtTokenKey.AccessToken) ?? {};
    const { value: clientCredentialsJwtCustomizer } =
      data?.find(({ key }) => key === LogtoJwtTokenKey.ClientCredentials) ?? {};

    return {
      accessTokenJwtCustomizer,
      clientCredentialsJwtCustomizer,
      isLoading,
      mutate,
    };
  }, [data, isLoading, mutate]);
}

export default useJwtCustomizer;
