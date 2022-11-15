import type { ConnectorResponse, ConnectorType } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import type { RequestError } from './use-api';

const useEnabledConnectorTypes = () => {
  const { data: connectors } = useSWR<ConnectorResponse[], RequestError>('/api/connectors');

  const enabledConnectors = useMemo(
    () => connectors?.filter(({ enabled }) => enabled).map(({ type }) => type) ?? [],
    [connectors]
  );

  const isConnectorTypeEnabled = useCallback(
    (connectorType: ConnectorType) => enabledConnectors.includes(connectorType),
    [enabledConnectors]
  );

  return {
    data: enabledConnectors,
    isConnectorTypeEnabled,
  };
};

export default useEnabledConnectorTypes;
