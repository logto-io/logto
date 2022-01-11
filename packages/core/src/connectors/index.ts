import { findConnectorByIdAndType, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import { ConnectorInstance } from './types';

const connectors: ConnectorInstance[] = [AliyunDM];

export const getConnectorById = (id: string): ConnectorInstance | null => {
  return connectors.find((connector) => connector.metadata.id === id) ?? null;
};

export const initConnectors = async () => {
  await Promise.all(
    connectors.map(async ({ metadata: { id, type } }) => {
      const record = await findConnectorByIdAndType(id, type);
      if (record) {
        return;
      }

      await insertConnector({
        id,
        type,
      });
    })
  );
};
