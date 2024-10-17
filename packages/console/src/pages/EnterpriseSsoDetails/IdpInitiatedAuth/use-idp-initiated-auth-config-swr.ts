import { type SsoConnectorIdpInitiatedAuthConfig } from '@logto/schemas';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

import { buildIdpInitiatedAuthConfigEndpoint } from './utils';

/**
 * Silently fetches the IdP initiated auth config for the given connector
 * Hide error toast.
 */
const useIdpInitiatedAuthConfigSWR = (connectorId: string) => {
  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<SsoConnectorIdpInitiatedAuthConfig>(fetchApi);

  return useSWR<SsoConnectorIdpInitiatedAuthConfig, RequestError>(
    buildIdpInitiatedAuthConfigEndpoint(connectorId),
    {
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
    }
  );
};

export default useIdpInitiatedAuthConfigSWR;
