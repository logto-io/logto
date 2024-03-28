import {
  LogtoJwtTokenPath,
  type AccessTokenJwtCustomizer,
  type ClientCredentialsJwtCustomizer,
} from '@logto/schemas';
import { type ResponseError } from '@withtyped/client';
import { useMemo } from 'react';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

import { getApiPath } from './utils/path';

function useJwtCustomizer() {
  const fetchApi = useApi({ hideErrorToast: true });
  const accessTokenFetcher = useSwrFetcher<AccessTokenJwtCustomizer>(fetchApi);
  const clientCredentialsFetcher = useSwrFetcher<ClientCredentialsJwtCustomizer>(fetchApi);

  const {
    data: accessTokenJwtCustomizer,
    isLoading: isAccessTokenJwtDataLoading,
    error: accessTokenError,
  } = useSWR<AccessTokenJwtCustomizer, ResponseError>(getApiPath(LogtoJwtTokenPath.AccessToken), {
    fetcher: accessTokenFetcher,
    shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
  });

  const {
    data: clientCredentialsJwtCustomizer,
    isLoading: isClientCredentialsJwtDataLoading,
    error: clientCredentialsError,
  } = useSWR<ClientCredentialsJwtCustomizer, ResponseError>(
    getApiPath(LogtoJwtTokenPath.ClientCredentials),
    {
      fetcher: clientCredentialsFetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
    }
  );

  // Show global loading status only if any of the fetchers are loading and no errors are present
  const isLoading =
    (isAccessTokenJwtDataLoading && !accessTokenError) ||
    (isClientCredentialsJwtDataLoading && !clientCredentialsError);

  return useMemo(
    () => ({
      accessTokenJwtCustomizer,
      clientCredentialsJwtCustomizer,
      isLoading,
    }),
    [accessTokenJwtCustomizer, clientCredentialsJwtCustomizer, isLoading]
  );
}

export default useJwtCustomizer;
