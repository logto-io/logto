import { adminTenantId, getManagementApiResourceIndicator, PredefinedScope } from '@logto/schemas';

export const getManagementApi = (tenantId: string) =>
  Object.freeze({
    indicator: getManagementApiResourceIndicator(tenantId),
    scopeAll: PredefinedScope.All,
  });

export const meApi = Object.freeze({
  indicator: getManagementApiResourceIndicator(adminTenantId, 'me'),
  scopeAll: PredefinedScope.All,
});
