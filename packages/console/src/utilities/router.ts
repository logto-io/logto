import { ConnectorType } from '@logto/schemas';
import { snakeCase } from 'snake-case';

import { ConnectorsTabs, UserTabs } from '@/consts/page-tabs';

export const getBasename = (prefix: string, developmentPort: string): string => {
  const isBasenameNeeded =
    process.env.NODE_ENV !== 'development' || process.env.PORT === developmentPort;

  return isBasenameNeeded ? '/' + prefix : '';
};

export const getApplicationsPathname = () => `/applications`;

export const getApplicationDetailsPathname = (appId: string) => `/applications/${appId}`;

export const getCreateApplicationPathname = () => `/applications/create`;

export const getApiResourcesPathname = () => `/api-resources`;

export const getApiResourceDetailsPathname = (resourceId: string) => `/api-resources/${resourceId}`;

export const getCreateApiResourcePathname = () => `/api-resources/create`;

export const getConnectorsPathname = (tab: ConnectorsTabs) => `/connectors/${tab}`;

export const getConnectorDetailsPathname = (connectorType: ConnectorType, connectorId: string) => {
  const tab =
    connectorType === ConnectorType.Social ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless;

  return `/connectors/${tab}/${connectorId}`;
};

export const getCreateConnectorPathname = (connectorType: ConnectorType) => {
  const tab =
    connectorType === ConnectorType.Social ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless;

  return `/connectors/${tab}/create/${snakeCase(connectorType, { delimiter: '-' })}`;
};

export const getUserPathname = (userId: string, tab: UserTabs) => `/users/${userId}/${tab}`;

export const getUserLogPathname = (userId: string, logId: string) =>
  `/users/${userId}/${UserTabs.Logs}/${logId}`;
