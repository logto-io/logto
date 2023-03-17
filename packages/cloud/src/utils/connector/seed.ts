import { generateStandardId } from '@logto/core-kit';
import { cloudApiIndicator } from '@logto/schemas';
import { GlobalValues } from '@logto/shared';

export const createCloudServiceConnector = (data: {
  tenantId: string;
  connectorId: string;
  appId: string;
  appSecret: string;
}) => {
  const globalValues = new GlobalValues();
  const { cloudUrlSet, adminUrlSet } = globalValues;
  const { tenantId, connectorId, appId, appSecret } = data;

  return {
    id: generateStandardId(),
    tenantId,
    connectorId,
    config: {
      appId,
      appSecret,
      tokenEndpoint: `${adminUrlSet.endpoint.toString()}oidc/token`,
      endpoint: `${cloudUrlSet.endpoint.toString()}api`,
      resource: cloudApiIndicator,
    },
  };
};
