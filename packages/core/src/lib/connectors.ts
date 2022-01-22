import { getConnectorInstances } from '@/connectors';
import { ConnectorInstance } from '@/connectors/types';

export { getConnectorInstanceById } from '@/connectors';

export const getAllConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  return getConnectorInstances();
};
