import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';

import type { ConnectorGroup } from '@/types/connector';

export const getConnectorGroups = <
  T extends ConnectorResponse | ConnectorFactoryResponse = ConnectorResponse,
>(
  connectors: T[]
) => {
  return connectors.reduce<Array<ConnectorGroup<T>>>((previous, item) => {
    const groupIndex = previous.findIndex(
      // Only group social connectors
      ({ target }) => target === item.target && item.type === ConnectorType.Social
    );

    if (groupIndex === -1) {
      return [
        ...previous,
        {
          id: item.id, // Take first connector's id as groupId, only used for indexing.
          isDemo: item.isDemo,
          name: item.name,
          logo: item.logo,
          logoDark: item.logoDark,
          description: item.description,
          target: item.target,
          type: item.type,
          isStandard: item.isStandard,
          isTokenStorageSupported: item.isTokenStorageSupported,
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
      };
    });
  }, []);
};

export const splitMarkdownByTitle = (markdown: string) => {
  const match = /# (.*)/.exec(markdown);

  const title = (match ? match[1] : '') ?? '';

  return {
    title,
    content: markdown.replace(title, ''),
  };
};
