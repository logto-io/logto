import type { CreateResource } from '../db-entries/index.js';
import { defaultTenantId } from './tenant.js';

export const managementResourceId = 'management-api';

export const managementResource: Readonly<CreateResource> = Object.freeze({
  tenantId: defaultTenantId,
  id: managementResourceId,
  /**
   * The fixed resource indicator for Management APIs.
   *
   * Admin Console requires the access token of this resource to be functional.
   */
  indicator: 'https://api.logto.io',
  name: 'Logto Management API',
});
