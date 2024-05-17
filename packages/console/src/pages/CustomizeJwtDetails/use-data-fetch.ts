import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import { type ResponseError } from '@withtyped/client';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { getApiPath } from '@/pages/CustomizeJwt/utils/path';
import { shouldRetryOnError } from '@/utils/request';

import { type Action, type JwtCustomizer } from './type';

const useDataFetch = <T extends LogtoJwtTokenKeyType>(tokenType: T, action: Action) => {
  const apiPath = getApiPath(tokenType);
  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<JwtCustomizer<T>>(fetchApi);

  // Return undefined if action is create
  const { isLoading, data, mutate, error } = useSWR<JwtCustomizer<T>, ResponseError>(
    action === 'create' ? undefined : apiPath,
    {
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
    }
  );

  return {
    // Show global loading status only if any of the fetchers are loading and no errors are present
    isLoading: isLoading && !error,
    data,
    mutate,
    error,
  };
};

export default useDataFetch;
