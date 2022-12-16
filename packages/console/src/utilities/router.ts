import { ConnectorType } from '@logto/schemas';
import kebabCase from 'lodash.kebabcase';

import { ConnectorsTabs, UserTabs } from '@/consts/page-tabs';
import { Page } from '@/consts/pathnames';

export const getBasename = (prefix: string, developmentPort: string): string => {
  const isBasenameNeeded =
    process.env.NODE_ENV !== 'development' || process.env.PORT === developmentPort;

  return isBasenameNeeded ? `/${prefix}` : '';
};

export const getApplicationsPathname = () => `/${Page.Applications}`;

export const getApplicationDetailsPathname = (appId: string) => `/${Page.Applications}/${appId}`;

export const getCreateApplicationPathname = () => `/${Page.Applications}/create`;

export const getApiResourcesPathname = () => `/${Page.ApiResources}`;

export const getApiResourceDetailsPathname = (resourceId: string) =>
  `/${Page.ApiResources}/${resourceId}`;

export const getCreateApiResourcePathname = () => `/${Page.ApiResources}/create`;

export const getConnectorsPathname = (tab: ConnectorsTabs) => `/${Page.Connectors}/${tab}`;

export const getConnectorDetailsPathname = (connectorType: ConnectorType, connectorId: string) => {
  const tab =
    connectorType === ConnectorType.Social ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless;

  return `/${Page.ApiResources}/${tab}/${connectorId}`;
};

export const getCreateConnectorPathname = (connectorType: ConnectorType) => {
  const tab =
    connectorType === ConnectorType.Social ? ConnectorsTabs.Social : ConnectorsTabs.Passwordless;

  return `/${Page.ApiResources}/${tab}/create/${kebabCase(connectorType)}`;
};

export const getUsersPathname = () => `/${Page.Users}`;

export const getUserDetailsPathname = (userId: string) =>
  `/${Page.Users}/${userId}/${UserTabs.Details}`;

export const getUserLogsPathname = (userId: string) => `/${Page.Users}/${userId}/${UserTabs.Logs}`;

export const getUserLogDetailsPathname = (userId: string, logId: string) =>
  `/${Page.Users}/${userId}/${UserTabs.Logs}/${logId}`;
