import { findConnectorById, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import { ConnectorInstance } from './types';

export const connectorInstances: Readonly<ConnectorInstance[]> = [AliyunDM];

export const getConnectorInstanceById = (id: string): ConnectorInstance | null => {
  return connectorInstances.find((connector) => connector.metadata.id === id) ?? null;
};

export const initConnectors = async () => {
  await Promise.all(
    connectorInstances.map(async ({ metadata: { id, type } }) => {
      const record = await findConnectorById(id);
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
