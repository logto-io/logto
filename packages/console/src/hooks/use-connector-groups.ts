import { ConnectorResponse, ConnectorType } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { RequestError } from '@/hooks/use-api';
import { ConnectorGroup } from '@/types/connector';

// Group connectors by target
const useConnectorGroups = () => {
  const { data, ...rest } = useSWR<ConnectorResponse[], RequestError>('/api/connectors');

  const groups = useMemo(() => {
    if (!data) {
      return;
    }

    return data.reduce<ConnectorGroup[]>((previous, item) => {
      const groupIndex = previous.findIndex(
        // Only group social connectors
        ({ target }) => target === item.target && item.type === ConnectorType.Social
      );

      if (groupIndex === -1) {
        return [
          ...previous,
          {
            id: item.id, // Take first connector's id as groupId, only used for indexing.
            name: item.name,
            logo: item.logo,
            logoDark: item.logoDark,
            description: item.description,
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
    connectors: data,
  };
};

export default useConnectorGroups;
