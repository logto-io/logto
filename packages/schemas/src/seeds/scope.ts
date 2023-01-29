import type { CreateScope } from '../db-entries/index.js';
import { managementResourceId } from './resource.js';
import { defaultTenantId } from './tenant.js';

export const managementResourceScopeId = 'management-api-scope';

export const managementResourceScope: Readonly<CreateScope> = Object.freeze({
  tenantId: defaultTenantId,
  id: managementResourceScopeId,
  name: 'management-api:default',
  description: 'Default scope for management API',
  resourceId: managementResourceId,
});
