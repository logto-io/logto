import { cloudApiIndicator } from '@logto/schemas';
import { generateStandardId, GlobalValues } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';

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
      tokenEndpoint: appendPath(adminUrlSet.endpoint, 'oidc/token').toString(),
      endpoint: appendPath(cloudUrlSet.endpoint, 'api').toString(),
      resource: cloudApiIndicator,
    },
  };
};
