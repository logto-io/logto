import type { ConnectorResponse } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import type { RequestError } from '@/hooks/use-api';
import { getConnectorGroups } from '@/pages/Connectors/utils';

// Group connectors by target
const useConnectorGroups = () => {
  const { data, ...rest } = useSWR<ConnectorResponse[], RequestError>('api/connectors');

  const groups = useMemo(() => {
    if (!data) {
      return;
    }

    return getConnectorGroups(data);
  }, [data]);

  return {
    ...rest,
    data: groups,
    connectors: data,
  };
};

export default useConnectorGroups;
