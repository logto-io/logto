import { getConnectorInstances } from '@/connectors';
import { ConnectorInstanceWithConnector } from '@/connectors/types';

export { getConnectorInstanceById } from '@/connectors';

export const getAllConnectorInstances = async (): Promise<ConnectorInstanceWithConnector[]> => {
  return getConnectorInstances();
};
