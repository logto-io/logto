import { getConnectorInstanceById } from '@/connectors';
import { findAllConnectors, findConnectorById } from '@/queries/connector';

export const getAllConnectorInfo = async () => {
  const connectors = await findAllConnectors();
  return connectors.map((connector) => {
    const { metadata } = getConnectorInstanceById(connector.id) ?? {};
    return { ...connector, ...metadata };
  });
};

export const getConnectorInfoById = async (id: string) => {
  const connector = await findConnectorById(id);
  const { metadata } = getConnectorInstanceById(id) ?? {};
  return { ...connector, ...metadata };
};
