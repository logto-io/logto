import type { ConnectorsPage } from '@/consts/page-tabs';

export const getBasename = (prefix: string, developmentPort: string): string => {
  const isBasenameNeeded =
    process.env.NODE_ENV !== 'development' || process.env.PORT === developmentPort;

  return isBasenameNeeded ? '/' + prefix : '';
};

export const getConnectorPathname = (tab: ConnectorsPage, connectorId?: string) =>
  `/connectors/${tab}${connectorId ? `/${connectorId}` : ''}`;
