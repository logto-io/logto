import {
  type SsoConnectorWithProviderConfig,
  type GetUserSsoIdentityResponse,
} from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

type Props = {
  userId?: string;
  connectorId?: string;
};

function useSsoIdentityData({ userId, connectorId }: Props) {
  const { data, isLoading, error, mutate } = useSWR<GetUserSsoIdentityResponse, RequestError>(
    userId &&
      connectorId &&
      `api/users/${userId}/sso-identities/${connectorId}?includeTokenSecret=true`
  );

  const { data: ssoConnector, isLoading: isSsoConnectorsLoading } = useSWR<
    SsoConnectorWithProviderConfig,
    RequestError
  >(`api/sso-connectors/${connectorId}`);

  return useMemo(
    () => ({
      isLoading: isLoading || isSsoConnectorsLoading,
      mutateSsoIdentity: mutate,
      ssoIdentityError: error,
      ssoIdentityData: data,
      ssoConnector,
    }),
    [data, error, isLoading, isSsoConnectorsLoading, mutate, ssoConnector]
  );
}

export default useSsoIdentityData;
