import {
  LogtoJwtTokenPath,
  type JwtCustomizerAccessToken,
  type JwtCustomizerClientCredentials,
} from '@logto/schemas';
import { type ResponseError } from '@withtyped/client';
import { useMemo } from 'react';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

import { getApiPath } from './utils';

function useJwtCustomizer() {
  const fetchApi = useApi({ hideErrorToast: true });
  const accessTokenFetcher = useSwrFetcher<JwtCustomizerAccessToken>(fetchApi);
  const clientCredentialsFetcher = useSwrFetcher<JwtCustomizerClientCredentials>(fetchApi);

  const {
    data: accessTokenJwtCustomizer,
    mutate: mutateAccessTokenJwtCustomizer,
    isLoading: isAccessTokenJwtDataLoading,
    error: accessTokenError,
  } = useSWR<JwtCustomizerAccessToken, ResponseError>(getApiPath(LogtoJwtTokenPath.AccessToken), {
    fetcher: accessTokenFetcher,
    shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
  });

  const {
    data: clientCredentialsJwtCustomizer,
    mutate: mutateClientCredentialsJwtCustomizer,
    isLoading: isClientCredentialsJwtDataLoading,
    error: clientCredentialsError,
  } = useSWR<JwtCustomizerClientCredentials, ResponseError>(
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
      mutateAccessTokenJwtCustomizer,
      mutateClientCredentialsJwtCustomizer,
    }),
    [
      accessTokenJwtCustomizer,
      clientCredentialsJwtCustomizer,
      isLoading,
      mutateAccessTokenJwtCustomizer,
      mutateClientCredentialsJwtCustomizer,
    ]
  );
}

export default useJwtCustomizer;
