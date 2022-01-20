import { connectorInstances, getConnectorInstanceById } from '@/connectors';
import { ConnectorInfo } from '@/connectors/types';
import { findConnectorById } from '@/queries/connector';

export const getAllConnectorInfo = async (): Promise<ConnectorInfo[]> => {
  return Promise.all(
    connectorInstances.map(async (connectorInstance) => {
      const { metadata } = connectorInstance;
      const connector = await findConnectorById(metadata.id);
      return { ...connector, metadata };
    })
  );
};

export const getConnectorInfoById = async (id: string): Promise<ConnectorInfo> => {
  const connector = await findConnectorById(id);
  const { metadata } = getConnectorInstanceById(connector.id) ?? {};
  return { ...connector, metadata };
};
