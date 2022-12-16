import type { ConnectorsTabs } from '@/consts/page-tabs';
import { UserTabs } from '@/consts/page-tabs';

export const getBasename = (prefix: string, developmentPort: string): string => {
  const isBasenameNeeded =
    process.env.NODE_ENV !== 'development' || process.env.PORT === developmentPort;

  return isBasenameNeeded ? '/' + prefix : '';
};

export const getConnectorPathname = (tab: ConnectorsTabs, connectorId?: string) =>
  `/connectors/${tab}${connectorId ? `/${connectorId}` : ''}`;

export const getUserPathname = (userId: string, tab: UserTabs) => `/users/${userId}/${tab}`;

export const getUserLogPathname = (userId: string, logId: string) =>
  `/users/${userId}/${UserTabs.Logs}/${logId}`;
