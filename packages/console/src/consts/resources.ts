import {
  adminTenantId,
  cloudApiIndicator,
  CloudScope,
  getManagementApiResourceIndicator,
  PredefinedScope,
} from '@logto/schemas';

export type ApiResource = {
  indicator: string;
  scopes: Record<string, string>;
};

export const getManagementApi = (tenantId: string) =>
  Object.freeze({
    indicator: getManagementApiResourceIndicator(tenantId),
    scopes: PredefinedScope,
  } satisfies ApiResource);

export const meApi = Object.freeze({
  indicator: getManagementApiResourceIndicator(adminTenantId, 'me'),
  scopes: PredefinedScope,
} satisfies ApiResource);

export const cloudApi = Object.freeze({
  indicator: cloudApiIndicator,
  scopes: CloudScope,
} satisfies ApiResource);
