import { getConnectorInstanceById } from '@/connectors';
import { findAllConnectors, findConnectorById } from '@/queries/connector';

export const getAllConnectorInfo = async () => {
  const connectors = await findAllConnectors();
  return connectors.map(({ id, ...rest }) => {
    const { metadata } = getConnectorInstanceById(id) ?? {};
    return { id, ...rest, ...metadata };
  });
};

export const getConnectorInfoById = async (id: string) => {
  const connector = await findConnectorById(id);
  const { metadata } = getConnectorInstanceById(id) ?? {};
  return { ...connector, ...metadata };
};
