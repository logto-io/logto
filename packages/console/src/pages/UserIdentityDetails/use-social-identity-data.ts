import { type ConnectorResponse, type GetUserSocialIdentityResponse } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

type Props = {
  userId?: string;
  target?: string;
};

function useSocialIdentityData({ userId, target }: Props) {
  const { data, isLoading, error, mutate } = useSWR<GetUserSocialIdentityResponse, RequestError>(
    userId && target && `api/users/${userId}/identities/${target}?includeTokenSecret=true`
  );

  const { data: connectors, isLoading: isConnectorsLoading } = useSWR<
    ConnectorResponse[],
    RequestError
  >('api/connectors');

  const connector = useMemo(() => {
    if (!connectors) {
      return;
    }
    return connectors.find((connector) => connector.target === target);
  }, [connectors, target]);

  return useMemo(
    () => ({
      isLoading: isLoading || isConnectorsLoading,
      mutateSocialIdentity: mutate,
      socialIdentityError: error,
      socialIdentityData: data,
      connector,
    }),
    [connector, data, error, isConnectorsLoading, isLoading, mutate]
  );
}

export default useSocialIdentityData;
