import RequestError from '@/errors/RequestError';
import { findConnectorById, hasConnector, insertConnector } from '@/queries/connector';

import * as AliyunDM from './aliyun-dm';
import * as GitHub from './github';
import { ConnectorInstance } from './types';

const allConnectors: ConnectorInstance[] = [AliyunDM, GitHub];

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  return Promise.all(
    allConnectors.map(async (element) => {
      const connector = await findConnectorById(element.metadata.id);

      return { connector, ...element };
    })
  );
};

export const getConnectorInstanceById = async (id: string): Promise<ConnectorInstance> => {
  const found = allConnectors.find((element) => element.metadata.id === id);

  if (!found) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  const connector = await findConnectorById(id);

  return { connector, ...found };
};

export const initConnectors = async () => {
  await Promise.all(
    allConnectors.map(async ({ metadata: { id } }) => {
      if (await hasConnector(id)) {
        return;
      }

      await insertConnector({
        id,
      });
    })
  );
};
