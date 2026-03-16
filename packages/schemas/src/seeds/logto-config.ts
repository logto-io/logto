import { type CreateLogtoConfig } from '../db-entries/index.js';
import type {
  AdminConsoleData,
  CloudConnectionData,
  ExtendedIdTokenClaim,
  IdTokenConfig,
} from '../types/index.js';
import { LogtoTenantConfigKey } from '../types/index.js';

import { cloudApiIndicator } from './cloud-api.js';

export const createDefaultAdminConsoleConfig = (
  forTenantId: string
): Readonly<{
  tenantId: string;
  key: LogtoTenantConfigKey;
  value: AdminConsoleData;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: LogtoTenantConfigKey.AdminConsole,
    value: {
      signInExperienceCustomized: false,
      organizationCreated: false,
    },
  } satisfies CreateLogtoConfig);

export const createCloudConnectionConfig = (
  forTenantId: string,
  appId: string,
  appSecret: string
): Readonly<{
  tenantId: string;
  key: LogtoTenantConfigKey;
  value: CloudConnectionData;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: LogtoTenantConfigKey.CloudConnection,
    value: {
      appId,
      appSecret,
      resource: cloudApiIndicator,
    },
  } satisfies CreateLogtoConfig);

export const createDefaultIdTokenConfig = (
  forTenantId: string
): Readonly<{
  tenantId: string;
  key: LogtoTenantConfigKey;
  value: IdTokenConfig;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: LogtoTenantConfigKey.IdToken,
    value: {
      enabledExtendedClaims: [
        'roles',
        'organizations',
        'organization_roles',
      ] satisfies ExtendedIdTokenClaim[],
    },
  } satisfies CreateLogtoConfig);
