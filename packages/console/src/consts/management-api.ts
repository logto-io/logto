import {
  adminTenantId,
  defaultTenantId,
  getManagementApiResourceIndicator,
  PredefinedScope,
} from '@logto/schemas';

export const managementApi = Object.freeze({
  indicator: getManagementApiResourceIndicator(defaultTenantId),
  scopeAll: PredefinedScope.All,
});

export const meApi = Object.freeze({
  indicator: getManagementApiResourceIndicator(adminTenantId, 'me'),
  scopeAll: PredefinedScope.All,
});
