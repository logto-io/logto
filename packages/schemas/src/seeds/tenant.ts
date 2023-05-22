import type { InferModelType } from '@withtyped/server';

import type { Tenants } from '../models/tenants.js';

export const defaultTenantId = 'default';
export const adminTenantId = 'admin';

/**
 * `createModel` from @withtyped/server can not properly infer the model
 * type, manually define it here for now.
 */
export type TenantModel = InferModelType<typeof Tenants>;
