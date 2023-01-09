import type { CreateScope } from '../db-entries/index.js';
import { managementResourceId } from './resource.js';

export const managementResourceScopeId = 'management-api-scope';

export const managementResourceScope: Readonly<CreateScope> = Object.freeze({
  id: managementResourceScopeId,
  name: 'default',
  description: 'Default scope for management API',
  resourceId: managementResourceId,
});
