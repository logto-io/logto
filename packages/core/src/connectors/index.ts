import { findConnectorByIdAndType, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import { ConnectorInstance } from './types';

const connectors: ConnectorInstance[] = [AliyunDM];

export const getConnectorById = (id: string): ConnectorInstance | undefined => {
  return connectors.find((connector) => connector.metadata.id === id);
};

export const initConnectors = async () => {
  await Promise.all(
    connectors.map(async (connector) => {
      const record = await findConnectorByIdAndType(connector.metadata.id, connector.metadata.type);
      if (!record) {
        await insertConnector({
          id: connector.metadata.id,
          type: connector.metadata.type,
        });
      }
    })
  );
};
