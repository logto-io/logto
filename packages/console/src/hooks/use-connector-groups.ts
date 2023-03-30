import type { ConnectorResponse } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { supportNativePlatformTargets } from '@/consts';
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

  const hasSupportNativePlatformTarget = useMemo(
    () => groups?.some(({ target }) => supportNativePlatformTargets.includes(target)) ?? false,
    [groups]
  );

  return {
    ...rest,
    data: groups,
    connectors: data,
    hasSupportNativePlatformTarget,
  };
};

export default useConnectorGroups;
