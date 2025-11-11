import type { CreateTenantIdConfig } from '../db-entries/index.js';

import { adminTenantId, defaultTenantId } from './tenant.js';

/**
 * Default tenant ID configuration for the default tenant.
 * Uses nanoid format for all ID types for backward compatibility.
 */
export const createDefaultTenantIdConfig = (
  tenantId: string = defaultTenantId
): Readonly<CreateTenantIdConfig> =>
  Object.freeze({
    tenantId,
    idFormat: 'nanoid',
  });

/**
 * Default tenant ID configuration for the admin tenant.
 * Uses nanoid format for all ID types for backward compatibility.
 */
export const createAdminTenantIdConfig = (): Readonly<CreateTenantIdConfig> =>
  createDefaultTenantIdConfig(adminTenantId);
