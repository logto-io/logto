import { ConnectorDTO } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { RequestError } from '@/hooks/use-api';
import { ConnectorGroup } from '@/types/connector';

// Group connectors by target
const useConnectorGroups = () => {
  const { data, ...rest } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');

  const groups = useMemo(() => {
    if (!data) {
      return;
    }

    return data.reduce<ConnectorGroup[]>((previous, item) => {
      const groupIndex = previous.findIndex(({ target }) => target === item.target);

      if (groupIndex === -1) {
        return [
          ...previous,
          {
            name: item.name,
            logo: item.logo,
            target: item.target,
            type: item.type,
            enabled: item.enabled,
            connectors: [item],
          },
        ];
      }

      return previous.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        return {
          ...group,
          connectors: [...group.connectors, item],
          // Group is enabled when any of its connectors is enabled.
          enabled: group.enabled || item.enabled,
        };
      });
    }, []);
  }, [data]);

  return {
    ...rest,
    data: groups,
  };
};

export default useConnectorGroups;
