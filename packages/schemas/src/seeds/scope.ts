import type { CreateScope } from '../db-entries/index.js';
import { managementResourceId } from './resource.js';
import { defaultTenantId } from './tenant.js';

export const managementApiScopeAll = 'management-api-all';

export const managementResourceScope: Readonly<CreateScope> = Object.freeze({
  tenantId: defaultTenantId,
  id: managementApiScopeAll,
  name: 'all',
  description: 'Default scope for Management API, allows all permissions.',
  resourceId: managementResourceId,
});
