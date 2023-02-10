import {
  defaultTenantId,
  getManagementApiResourceIndicator,
  managementApiScopeAll,
} from '@logto/schemas';

export const managementApi = Object.freeze({
  indicator: getManagementApiResourceIndicator(defaultTenantId),
  scopeAll: managementApiScopeAll,
});
