import RequestError from '@/errors/RequestError';
import { findConnectorById, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import { ConnectorInstance, ConnectorInstanceWithConnector } from './types';

const connectorInstancesWithoutConnector: ConnectorInstance[] = [AliyunDM];

export const getConnectorInstances = async (): Promise<ConnectorInstanceWithConnector[]> => {
  return Promise.all(
    connectorInstancesWithoutConnector.map(async (connectorInstanceWithoutConnector) => {
      const connector = await findConnectorById(connectorInstanceWithoutConnector.metadata.id);
      return { connector, ...connectorInstanceWithoutConnector };
    })
  );
};

export const getConnectorInstanceById = async (
  id: string
): Promise<ConnectorInstanceWithConnector> => {
  const pickedConnectorInstanceWithoutConnector = connectorInstancesWithoutConnector.find(
    (connectorInstanceWithoutConnector) => connectorInstanceWithoutConnector.metadata.id === id
  );
  if (!pickedConnectorInstanceWithoutConnector) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  const connector = await findConnectorById(id);
  return { connector, ...pickedConnectorInstanceWithoutConnector };
};

export const initConnectors = async () => {
  await Promise.all(
    connectorInstancesWithoutConnector.map(async ({ metadata: { id } }) => {
      const record = await findConnectorById(id);
      if (record) {
        return;
      }

      await insertConnector({
        id,
      });
    })
  );
};
