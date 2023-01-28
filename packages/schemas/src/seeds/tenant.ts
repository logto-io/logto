import type { InferModelType } from '@withtyped/server';

import type { Tenants } from '../models/tenants.js';

export const defaultTenantId = 'default';
export const adminTenantId = 'admin';

export const defaultTenant: InferModelType<typeof Tenants> = {
  id: defaultTenantId,
  dbUserPassword: null,
};
